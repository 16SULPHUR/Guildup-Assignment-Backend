
import { Request, Response } from 'express';
import * as packageService from '../services/packageService.js';
import { getLocalizedPrice, LocalizedPriceInfo } from '../services/pricingService.js'; // Correct import
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { ICourse } from '../models/Course.js'; // For typing populated courses
import { IPackage } from '../models/Package.js'; // For typing packages

async function getLocalizedPackageDetails(pkg: any, userLocation?: string) {
    const packageObject = pkg.toObject ? pkg.toObject() : { ...pkg };

    let baseTotalPriceUSD = 0;
    if (packageObject.courses && Array.isArray(packageObject.courses)) {
        baseTotalPriceUSD = (packageObject.courses as ICourse[]).reduce((sum, course) => {
            
            const price = typeof course === 'object' && course !== null && 'price' in course ? (course as ICourse).price : 0;
            return sum + (price || 0);
        }, 0);
    }
    packageObject.baseTotalPriceUSD = baseTotalPriceUSD;

    if (userLocation && baseTotalPriceUSD >= 0) { // Allow 0 price for blacklist check
        const localizedPriceInfo: LocalizedPriceInfo = await getLocalizedPrice(baseTotalPriceUSD, userLocation);
        if (localizedPriceInfo.isBlacklisted) {
            packageObject.localizedPriceInfo = { message: localizedPriceInfo.message, isBlacklisted: true, originalPriceUSD: baseTotalPriceUSD, originalCurrency: 'USD' };
        } else {
            packageObject.localizedPriceInfo = localizedPriceInfo;
        }
    }
    return packageObject;
}

export const createPackage = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new AppError('Authentication required to create a package.', 401);
    const { title, courseIds, image } = req.body;
    // CreatorId is the logged-in user
    const newPackage = await packageService.createPackageService(title, courseIds, req.user.id, image);
    res.status(201).json({ status: 'success', data: newPackage });
});

export const getAllPackages = asyncHandler(async (req: Request, res: Response) => {
    // ... localization logic remains same ...
    const userLocation = req.query.location as string || req.headers['x-user-location'] as string;
    const packages = await packageService.getAllPackagesService();

    const processedPackages = await Promise.all(
        packages.map(pkg => getLocalizedPackageDetails(pkg, userLocation))
    );
    res.status(200).json({ status: 'success', results: processedPackages.length, data: processedPackages });
});

export const getPackageById = asyncHandler(async (req: Request, res: Response) => {
    // ... localization logic remains same ...
    const userLocation = req.query.location as string || req.headers['x-user-location'] as string;
    const pkg = await packageService.getPackageByIdService(req.params.packageId);
    if (!pkg) {
        throw new AppError('Package not found from controller', 404);
    }
    const processedPackage = await getLocalizedPackageDetails(pkg, userLocation);
    res.status(200).json({ status: 'success', data: processedPackage });
});

export const updatePackage = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new AppError('Authentication required to update a package.', 401);
    const updatedPackage = await packageService.updatePackageService(req.params.packageId, req.body, req.user.id);
    res.status(200).json({ status: 'success', data: updatedPackage });
});

export const deletePackageById = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new AppError('Authentication required to delete a package.', 401);
    await packageService.deletePackageService(req.params.packageId, req.user.id);
    res.status(204).json({ status: 'success', data: null });
});


export const getMyPackages = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new AppError('Authentication required.', 401);

    const packagesFromDB = await packageService.getPackagesByCreatorIdService(req.user.id); // New service method

    const userLocation = req.query.location as string | undefined;

    if (userLocation && packagesFromDB.length > 0) {
        const processedPackages = await Promise.all(
            packagesFromDB.map(async (pkgDoc) => {
                const pkg = pkgDoc.toObject ? pkgDoc.toObject() : { ...pkgDoc };

                // Calculate base total price for this package
                let baseTotalPriceUSD = 0;
                if (pkg.courses && Array.isArray(pkg.courses) && pkg.courses.length > 0) {
                    // This assumes courses are populated with their price. If not, you need to fetch them.
                    // For `getPackagesByCreatorIdService`, ensure courses are populated with at least 'price'.
                     baseTotalPriceUSD = (pkg.courses as ICourse[]).reduce((sum, course) => sum + (course.price || 0), 0);
                }
                pkg.baseTotalPriceUSD = baseTotalPriceUSD;

                const localizedPriceInfo: LocalizedPriceInfo = await getLocalizedPrice(baseTotalPriceUSD, userLocation);
                return { ...pkg, localizedPriceInfo };
            })
        );
        return res.status(200).json({ status: 'success', results: processedPackages.length, data: processedPackages });
    }

    // If no location, or if backend doesn't auto-calculate baseTotalPriceUSD without location, do it here too for consistency.
    const packagesWithBasePrice = packagesFromDB.map(pkgDoc => {
        const pkg = pkgDoc.toObject ? pkgDoc.toObject() : { ...pkgDoc };
        if (!pkg.baseTotalPriceUSD) { // Calculate if not already present
            let baseTotalPriceUSD = 0;
            if (pkg.courses && Array.isArray(pkg.courses) && pkg.courses.length > 0) {
                 baseTotalPriceUSD = (pkg.courses as ICourse[]).reduce((sum, course) => sum + (course.price || 0), 0);
            }
            pkg.baseTotalPriceUSD = baseTotalPriceUSD;
        }
        return pkg;
    });


    res.status(200).json({ status: 'success', results: packagesWithBasePrice.length, data: packagesWithBasePrice });
});
