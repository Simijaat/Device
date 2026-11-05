const fs = require('fs');

let content = fs.readFileSync('web/src/services/apiClient.ts', 'utf8');

if (!content.includes('register: async (username: string, password: string)')) {
    content = content.replace(
      'login: async (username: string, password: string) => {\n      const response = await api.post(\'/auth/login\', { username, password });\n      return response.data;\n  },',
      'login: async (username: string, password: string) => {\n      const response = await api.post(\'/auth/login\', { username, password });\n      return response.data;\n  },\n\n  register: async (username: string, password: string) => {\n      const response = await api.post(\'/auth/register\', { username, password });\n      return response.data;\n  },'
    );
    fs.writeFileSync('web/src/services/apiClient.ts', content);
}
