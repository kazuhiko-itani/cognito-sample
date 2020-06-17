import * as React from "react";
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserSession
} from "amazon-cognito-identity-js";
import * as AWS from "aws-sdk/global";
import axios from "axios";

const authenticationData = {
  Username: "sample-cognito",
  Password: "Password0"
};

const authenticationDetails = new AuthenticationDetails(authenticationData);

const poolData = {
  UserPoolId: "ap-northeast-1_5T1MLZf2V",
  ClientId: "73gs8dt4s2g33dsl5c5eggiuaf"
};

const userPool = new CognitoUserPool(poolData);

const userData = {
  Username: "sample-cognito",
  Pool: userPool
};

const cognitoUser = new CognitoUser(userData);

const createClient = (token: string) => {
  const headers: any = {
    "Content-Type": "application/json",
    Authorization: token
  };
  const instance = axios.create({
    baseURL: "https://bueyjyc3v9.execute-api.ap-northeast-1.amazonaws.com",
    headers: headers,
    responseType: "json"
  });

  return instance;
};

export const App: React.FC = () => {
  React.useEffect(() => {
    const currentUser = userPool.getCurrentUser();

    if (!currentUser) {
      // location.href = "/login";
      return;
    }

    const user = currentUser as CognitoUser;
    user.getSession((err: any, result: CognitoUserSession) => {
      if (result) {
        console.log("You are now logged in.");

        AWS.config.region = "ap-northeast-1";

        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
          IdentityPoolId: "ap-northeast-1:eef55068-7fa8-430f-bfd9-d4dc2a1f14b6",
          Logins: {
            "cognito-idp.ap-northeast-1.amazonaws.com/ap-northeast-1_5T1MLZf2V": result
              .getIdToken()
              .getJwtToken()
          }
        });
      }
    });
  });

  const auth = () => {
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: function (result) {
        console.log("onSuccess", result);

        AWS.config.region = "ap-northeast-1";

        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
          IdentityPoolId: "ap-northeast-1:eef55068-7fa8-430f-bfd9-d4dc2a1f14b6",
          Logins: {
            "cognito-idp.ap-northeast-1.amazonaws.com/ap-northeast-1_5T1MLZf2V": result
              .getIdToken()
              .getJwtToken()
          }
        });

        const credentials = AWS.config.credentials as AWS.Credentials;

        credentials.refresh(error => {
          if (error) {
            console.error(error);
          } else {
            console.log("Successfully logged!");
          }
        });
      },

      onFailure: function (err) {
        console.log("OnFailure", err);
      }
    });
  };

  const logout = () => {
    cognitoUser.signOut();
  };

  const getData = async () => {
    const currentUser = userPool.getCurrentUser();
    if (!currentUser) {
      console.log("need loggedIn");
      return;
    }

    const user = currentUser as CognitoUser;
    let token = "";

    user.getSession((err: any, result: CognitoUserSession) => {
      if (result) {
        token = result.getIdToken().getJwtToken();
      }
    });

    console.log(token);

    const client = createClient(token);
    const data = await client.get("/test/cognito-sample");
    console.log(data);
  };

  return (
    <div>
      <button onClick={() => auth()}>ログイン</button>
      <button onClick={() => logout()}>ログアウト</button>
      <button onClick={() => getData()}>fetch</button>
    </div>
  );
};
