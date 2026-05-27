function formatUptime(seconds: number): string {
    const units = [
        { label: "y", secs: 365 * 24 * 3600 },
        { label: "d", secs: 24 * 3600 },
        { label: "h", secs: 3600 },
        { label: "m", secs: 60 },
        { label: "s", secs: 1 },
    ];

    const parts: string[] = [];
    for (const { label, secs } of units) {
        const value = Math.floor(seconds / secs);
        if (value > 0) {
            parts.push(`${value}${label}`);
            seconds %= secs;
        }
    }

    return parts.slice(0, 2).join(" ") || "0s";
}

export default formatUptime