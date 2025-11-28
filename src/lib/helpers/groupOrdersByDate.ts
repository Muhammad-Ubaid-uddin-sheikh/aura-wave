import { format, isToday, isYesterday, parseISO } from "date-fns"

export function groupOrdersByDate(orders: any[]) {
    const grouped: Record<string, any[]> = {} // Initialize an empty object to hold grouped orders

    // Iterate through each order
    for (const order of orders) {
        const date = parseISO(order._createdAt) // Convert string to Date object e.g. "2025-06-05T12:00:00Z"
        let label = format(date, "EEE, dd MMM") // convert to "EEE, dd MMM" format e.g. "Thu, 05 Jun"
        if (isToday(date)) label = "Today" // Check if the date is today
        else if (isYesterday(date)) label = "Yesterday" // Check if the date is yesterday

        if (!grouped[label]) grouped[label] = [] // If the label doesn't exist, create an empty array
        grouped[label].push(order) // Add the order to the array
    }

    return grouped // Return the grouped orders
}