const useSigninUrl = () => {
    // Allows for quickly logging in with different roles - changing
    // roles would otherwise require leaving and joining GitHub teams
    const matchedFakeRole = window.location.href.match(/fakeRole=(\w*)/);
    let dataFromFrontend = '';
    if (matchedFakeRole) {
        dataFromFrontend += `fakeRole-${matchedFakeRole[1]}`;
    }
    return `/api/auth/oauth?dataFromFrontend=` + dataFromFrontend;
};

export default useSigninUrl;
