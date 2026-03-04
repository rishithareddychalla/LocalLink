export function scanFileBeforeDownload(file) {
    const dangerousExtensions = [
        "exe", "bat", "cmd", "scr", "ps1", "sh", "msi", "dll", "js"
    ];

    const suspiciousDoubleExtensionPattern = /\.[a-z0-9]+\.(exe|bat|cmd|scr|ps1)$/i;

    const name = file.name.toLowerCase();
    const extension = name.split(".").pop();

    // Block dangerous extension
    if (dangerousExtensions.includes(extension)) {
        return {
            safe: false,
            reason: "Blocked: Executable file types are not allowed."
        };
    }

    // Block double extensions like file.pdf.exe
    if (suspiciousDoubleExtensionPattern.test(name)) {
        return {
            safe: false,
            reason: "Blocked: Suspicious double file extension detected."
        };
    }

    // Block oversized files (> 200MB)
    const MAX_SIZE = 200 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
        return {
            safe: false,
            reason: "Blocked: File exceeds allowed size limit (200MB)."
        };
    }

    return { safe: true };
}
