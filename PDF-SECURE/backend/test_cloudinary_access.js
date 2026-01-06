require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const https = require('https');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Test cases
const publicId = 'pdf-viewer/0782da2b-81c6-430b-b89d-f11524bd281b/5c6e308a-ef44-4d03-a997-2812b0361336'; // Replace with actual ID
const resourceTypes = ['image', 'raw', 'auto'];
const types = ['upload', 'authenticated'];

async function testAccess() {
    console.log('Testing Cloudinary Access...');
    console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);

    for (const rType of resourceTypes) {
        for (const type of types) {
            console.log(`\n--- Testing resource_type: ${rType}, type: ${type} ---`);

            const url = cloudinary.url(publicId, {
                resource_type: rType,
                type: type,
                sign_url: true,
                secure: true
            });

            console.log('Generated URL:', url);

            await new Promise(resolve => {
                https.get(url, (res) => {
                    console.log(`Status: ${res.statusCode}`);
                    if (res.statusCode === 200) {
                        console.log('SUCCESS! This combination works.');
                    } else {
                        console.log('Failed.');
                    }
                    resolve();
                }).on('error', (e) => {
                    console.error('Error:', e.message);
                    resolve();
                });
            });
        }
    }
}

testAccess();
