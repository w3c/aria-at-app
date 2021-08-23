export const handleRawResponse = async response => response;

export const handleResponse = async response => response.data;

export const handleError = error => {
    throw error;
};
