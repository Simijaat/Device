const fs = require('fs');

let content = fs.readFileSync('web/src/pages/Login.tsx', 'utf8');

content = content.replace(
  'const [loading, setLoading] = useState(false);',
  'const [loading, setLoading] = useState(false);\n  const [isRegistering, setIsRegistering] = useState(false);'
);

content = content.replace(
  'const result = await apiClient.login(username, password);',
  'if (isRegistering) { await apiClient.register(username, password); }\n      const result = await apiClient.login(username, password);'
);

content = content.replace(
  'setError(err.response?.data?.error || "Login failed");',
  'setError(err.response?.data?.error || (isRegistering ? "Registration failed" : "Login failed"));'
);

content = content.replace(
  '{loading ? "Authenticating..." : "Sign in to Dashboard"}',
  '{loading ? "Processing..." : (isRegistering ? "Initialize Account" : "Sign in to Dashboard")}'
);

content = content.replace(
  '</form>',
  '  <div className="text-center mt-4 text-sm text-indigo-900/60 font-medium cursor-pointer hover:text-indigo-600" onClick={() => { setIsRegistering(!isRegistering); setError(""); }}>{isRegistering ? "Back to Login" : "First time setup? Initialize account"}</div>\n        </form>'
);

fs.writeFileSync('web/src/pages/Login.tsx', content);
