// resources/js/utils/format-date.ts
export function formatDate(date: string | null): string {
    if (!date) return "";
    return new Date(date).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    });
}
