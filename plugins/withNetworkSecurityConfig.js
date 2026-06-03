const { withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const NETWORK_SECURITY_CONFIG = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
</network-security-config>
`;

function withNetworkSecurityConfig(config) {
    // Step 1: Write network_security_config.xml to Android res/xml/
    config = withDangerousMod(config, [
        'android',
        async (config) => {
            const xmlDir = path.join(
                config.modRequest.platformProjectRoot,
                'app', 'src', 'main', 'res', 'xml'
            );
            if (!fs.existsSync(xmlDir)) {
                fs.mkdirSync(xmlDir, { recursive: true });
            }
            fs.writeFileSync(
                path.join(xmlDir, 'network_security_config.xml'),
                NETWORK_SECURITY_CONFIG
            );
            return config;
        },
    ]);

    // Step 2: Reference the config in AndroidManifest.xml <application>
    config = withAndroidManifest(config, (config) => {
        const mainApplication = config.modResults.manifest.application[0];
        mainApplication.$['android:networkSecurityConfig'] = '@xml/network_security_config';
        mainApplication.$['android:usesCleartextTraffic'] = 'true';
        return config;
    });

    return config;
}

module.exports = withNetworkSecurityConfig;
