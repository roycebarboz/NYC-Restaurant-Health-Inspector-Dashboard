import xss from "xss";

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

export const sanitizeData = (req,res,next) => {
    if(req.body && typeof req.body === "object"){
        for (const key in req.body){
            if (typeof req.body[key] === "string"){req.body[key] = xss(req.body[key].trim());}
        }
    }
    if(req.params && typeof req.params === "object"){
        for (const key in req.params){
            if (typeof req.params[key] === "string"){req.params[key] = xss(req.params[key].trim());}
        }
    }
    if(req.query && typeof req.query === "object"){
        for (const key in req.query){
            if (typeof req.query[key] === "string"){req.query[key] = xss(req.query[key].trim());}
        }
    }
    next();
}