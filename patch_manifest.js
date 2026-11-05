const fs = require('fs');

let content = fs.readFileSync('android/app/src/main/AndroidManifest.xml', 'utf8');

content = content.replace(
  '    <uses-permission android:name="android.permission.QUERY_ALL_PACKAGES" tools:ignore="QueryAllPackagesPermission" />\n',
  ''
);

fs.writeFileSync('android/app/src/main/AndroidManifest.xml', content);
