const useSigninUrl = () => {
    // Allows for quickly logging in with different roles - changing
    // roles would otherwise require leaving and joining GitHub teams
    const matchedFakeRole = window.location.href.match(/fakeRole=(\w*)/);
    const matchedFakeCompany = window.location.href.match(/company=(\w*)/);
    let dataFromFrontend = '';
    if (matchedFakeRole) {
        dataFromFrontend += `fakeRole-${matchedFakeRole[1]}`;
    }
    if (matchedFakeCompany) {
        dataFromFrontend += `&fakeVendorData=company-${matchedFakeCompany[1]}`;
    }
    return (
        `${process.env.API_SERVER}/api/auth/oauth?dataFromFrontend=` +
        dataFromFrontend
    );
};

export default useSigninUrl;
