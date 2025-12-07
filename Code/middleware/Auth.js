export const loggingMiddle = (req, res, next) => {
    const timestamp = new Date().toUTCString();
    const method = req.method;
    const path = req.path;
    const user = req.session.user

    let auth

    if(!user){auth = "Non-Authenticated";}
    else{auth =  "Authenticated User";}

    console.log(`[${timestamp}]: ${method} ${path} (${auth})`);
    next();
};

export const redirect = (req, res, next) => {
    const user = req.session.user;

    if(!user){return next();}
    return res.redirect("/landing_page");
};

export const loginRedirect = (req, res, next) => {
    const user = req.session.user;

    if(!user){return res.redirect("/login");}
    next();
};

export const signingout = (req, res, next) => {
    const user = req.session.user;

    if(!user){return res.redirect("/login");}
    next();
};