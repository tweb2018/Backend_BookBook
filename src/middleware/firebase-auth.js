const firebaseAdmin = require('firebase-admin');

const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URL,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_x509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_x509_CERT_URL
};

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  databaseURL: 'https://bookbook-c5c5c.firebaseio.com'
});

//Create authentication middle
isAuthenticated = (req, res, next) => {
  // check if user is logged in
  // if they are not send and unathorized response
  const authorization = req.header('Authorization');
  if (authorization) {
    firebaseAdmin
      .auth()
      .verifyIdToken(authorization)
      .then(decodeToken => {
        res.locals.user = decodeToken;
        next();
      })
      .catch(err => {
        res.sendStatus(401);
      });
  } else {
    res.sendStatus(401);
  }
};

// return user if exist
getUuidToken = authToken => {
  if (authToken !== null) {
    return firebaseAdmin
      .auth()
      .verifyIdToken(authToken)
      .then(decodedToken => {
        return decodedToken.uid;
      });
  }
};

module.exports = {
  isAuthenticated,
  getUuidToken
};
