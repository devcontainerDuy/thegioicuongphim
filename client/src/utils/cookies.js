import Cookies from 'js-cookie';

const COOKIE_NAME = 'access_token';
const COOKIE_DAYS = 7;

// Cookie options
const cookieOptions = {
    expires: COOKIE_DAYS,
    path: '/',
    sameSite: 'Lax',
    secure: window.location.protocol === 'https:',
};

/**
 * Set access token in cookie
 */
export const setAccessToken = (token) => {
    Cookies.set(COOKIE_NAME, token, cookieOptions);
};

/**
 * Get access token from cookie
 */
export const getAccessToken = () => {
    return Cookies.get(COOKIE_NAME) || null;
};

/**
 * Remove access token cookie
 */
export const removeAccessToken = () => {
    Cookies.remove(COOKIE_NAME, { path: '/' });
};

const cookies = {
    setAccessToken,
    getAccessToken,
    removeAccessToken,
};

export default cookies;

