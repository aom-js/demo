import "config";
import prompt from "prompt";
import { DocumentType } from "@typegoose/typegoose";
import * as schemas from "schemas";
import models from "models";
import { LoginTypes } from "common/types";

/*
const models = {
  Users: schemas.Users.getModel(),
  UsersLogins: schemas.UsersLogins.getModel(),
  UsersLoginsAuthorizations: schemas.UsersLoginsAuthorizations.getModel(),
  UsersPermissions: schemas.UsersPermissions.getModel(),
};
*/

console.log("add superuser");
//
// Start the prompt
//
prompt.start();

prompt.stop = function () {
  if (prompt.stopped || !prompt.started) {
    return;
  }

  // stdin.destroy();
  prompt.emit("stop");
  prompt.stopped = true;
  prompt.started = false;
  prompt.paused = false;
  // return;
};

//
// Get two properties from the user: username and password
//

function enterUsername() {
  const schema = {
    properties: {
      username: {
        description: "Enter username",
        pattern: /^[a-z,A-Z,0-9]+$/,
        message: "Username must contains only letters and digits",
        required: true,
      },
    },
  };

  prompt.get(schema, async (err, result) => {
    //
    // Log the results.
    //
    const { username } = result;
    const loginData = {
      type: LoginTypes.PLAIN,
      value: username,
    };

    const checkLogin = await models.UsersLogins.findOne(loginData);
    if (checkLogin) {
      console.error(`Username \`${username}\` is busy. Enter new value`);
      enterUsername();
    } else {
      console.log(`Username \`${username}\` is available.`);
      const newLogin = new models.UsersLogins(loginData);
      enterPassword(newLogin);
    }
  });
}

function enterPassword(newLogin: DocumentType<schemas.UsersLogins>) {
  const schema = {
    properties: {
      password: {
        description: "Enter password",
        message: "Password is required!",
        hidden: true,
        required: true,
      },
    },
  };

  prompt.get(schema, async (err, result) => {
    //
    // Log the results.
    //
    const newUser = await models.Users.create({
      name: newLogin.value,
      enabled: true,
    });

    newLogin.userId = newUser._id;
    newLogin.enabled = true;
    await newLogin.save();

    // добавим разрешения суперадминистратора
    await models.UsersPermissions.updateOne(
      { userId: newUser._id },
      { $set: { isSuperAdmin: true } },
      { upsert: true }
    );

    const newPassword = new models.UsersLoginsAuthorizations();
    newPassword.userLoginId = newLogin._id;
    newPassword.secret = models.UsersLoginsAuthorizations.encryptPassword(
      result.password
    );
    newPassword.enabled = true;
    await newPassword.save();

    console.log("New user added");
    console.log(`username:`, newLogin.value);
    console.log(`password:`, result.password);
    process.exit();
  });
}

setTimeout(() => enterUsername(), 1000);
