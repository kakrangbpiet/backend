/* eslint-disable @typescript-eslint/no-explicit-any */
// Helper function to serialize BigInt properties in an object
export function serializeBigInt(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj; // Return non-object values as-is
    }

    // Create a new object to hold the serialized values
    const serializedObj = {};

    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];
            // Check if the value is a BigInt
            if (typeof value === 'bigint') {
                serializedObj[key] = value.toString(); // Convert BigInt to string
            } else if (Array.isArray(value)) {
                serializedObj[key] = value.map(item => serializeBigInt(item)); // Recursively serialize arrays
            } else if (value !== null && typeof value === 'object') {
                serializedObj[key] = serializeBigInt(value); // Recursively serialize objects
            } else {
                serializedObj[key] = value; // Return other types as-is
            }
        }
    }

    return serializedObj;
}