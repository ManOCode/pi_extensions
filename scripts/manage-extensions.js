const fs = require('fs');
const path = require('path');
const os = require('os');

const EXTENSIONS_DIR = path.join(process.cwd(), '.pi', 'extensions');
const PACKAGES_DIR = path.join(process.cwd(), 'packages');

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function findPackageFolder(packageName) {
    if (!fs.existsSync(PACKAGES_DIR)) {
        console.error(`Error: Packages directory ${PACKAGES_DIR} not found.`);
        process.exit(1);
    }

    const packages = fs.readdirSync(PACKAGES_DIR);
    for (const pkg of packages) {
        const pkgJsonPath = path.join(PACKAGES_DIR, pkg, 'package.json');
        if (fs.existsSync(pkgJsonPath)) {
            try {
                const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
                if (pkgJson.name === packageName || pkg === packageName) {
                    return pkg;
                }
            } catch (e) {
                // skip invalid json
            }
        }
    }
    return null;
}

function add(packageName) {
    const packageFolder = findPackageFolder(packageName);

    if (!packageFolder) {
        console.error(`Error: Package ${packageName} not found in ${PACKAGES_DIR}`);
        process.exit(1);
    }

    ensureDir(EXTENSIONS_DIR);

    const source = path.join(PACKAGES_DIR, packageFolder, 'dist');
    const target = path.join(EXTENSIONS_DIR, packageFolder);

    if (!fs.existsSync(source)) {
        console.error(`Error: dist folder not found in ${source}. Please run 'npm run build' first.`);
        process.exit(1);
    }

    if (fs.existsSync(target)) {
        console.log(`Extension ${packageFolder} is already installed.`);
        return;
    }

    try {
        const type = (os.platform() === 'win32') ? 'junction' : 'dir';
        fs.symlinkSync(source, target, type);
        console.log(`Successfully added ${packageFolder} to ${EXTENSIONS_DIR}`);
    } catch (err) {
        console.error(`Error creating symlink: ${err.message}`);
        process.exit(1);
    }
}

function remove(packageName) {
    const packageFolder = findPackageFolder(packageName);

    if (!packageFolder) {
        console.error(`Error: Package ${packageName} not found in ${PACKAGES_DIR}`);
        process.exit(1);
    }

    const target = path.join(EXTENSIONS_DIR, packageFolder);

    if (!fs.existsSync(target)) {
        console.log(`Extension ${packageFolder} is not installed.`);
        return;
    }

    try {
        fs.rmSync(target, { recursive: true, force: true });
        console.log(`Successfully removed ${packageFolder} from ${EXTENSIONS_DIR}`);
    } catch (err) {
        console.error(`Error removing extension: ${err.message}`);
        process.exit(1);
    }
}

const [,, command, name] = process.argv;

if (command === 'add' && name) {
    add(name);
} else if (command === 'remove' && name) {
    remove(name);
} else {
    console.log('Usage: node scripts/manage-extensions.js <add|remove> <package-name|folder-name>');
}
