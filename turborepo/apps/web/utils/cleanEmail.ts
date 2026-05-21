export default function cleanEmail (email : string) {
    if (typeof email != "string") return null;

    let s = email.trim().toLowerCase();
    s = s.normalize?.("NFKC") ?? s;
    s = s.replace(/[\u0000-\u001f\u007f]/g, "");

    if (s.length === 0 || s.length > 254) return null;

    const parts = s.split("@");
    if (parts.length !==2) return null;
    const [local, domain] = parts;
    
    if (!local) return null;
    if (!domain) return null;

    if (local?.length === 0 || local?.length > 64) return null;
    if (domain.length === 0 || domain.length > 253) return null;


    // Domain labels must be 1-63 chars
    const domainLabels = domain.split(".");
    if (domainLabels.some((lbl) => lbl.length === 0 || lbl.length > 63)) return null;

    // Allow common local-part chars (or quoted local parts)
    const localRegex = /^[a-z0-9.!#$%&'*+\/=?^_`{|}~\-]+$/i;
    const quotedLocal = /^".+"$/;
    if (!localRegex.test(local) && !quotedLocal.test(local)) return null;

    // Domain: labels with letters/numbers/hyphens, ending in a TLD (2+ letters)
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9\-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;
    if (!domainRegex.test(domain)) return null;

    return s;
}