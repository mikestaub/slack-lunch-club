// @flow

import handlebars from "handlebars";
import reflect from "p-reflect";

import Config from "../../../../../../config";
import adminErrorHtml from "../../email/adminError.html";

import type { IMailer } from "backend-types";
import type { User } from "graphql-types";

async function emailAdminsPartialFailures({
  config,
  db,
  mailer,
  promises,
}: {
  config: Config,
  db: Object,
  mailer: IMailer,
  promises: Array<Promise<any>>,
}): Promise<boolean> {
  const errors = await Promise.all(promises.map(reflect)).then(promises =>
    promises.filter(p => p.isRejected).map(p => p.reason),
  );

  const success = errors.length === 0;
  if (!success) {
    const collectionName = db.graphConfig.topology.vertices.USERS;
    const adminUsers = await db.getVertices(collectionName, { role: "ADMIN" });
    const adminEmails = adminUsers.map(user => user.email);
    await emailAdminsError({
      mailer,
      to: adminEmails,
      from: config.email.noreplyAddress,
      errors,
    });
  }
  return success;
}

async function emailAdminsError({
  mailer,
  to,
  from,
  errors,
}: {
  mailer: IMailer,
  to: Array<string> | string,
  from: string,
  errors: Array<Error>,
}): Promise<Object> {
  const params = { errors };
  const html = handlebars.compile(adminErrorHtml)(params);
  const message = {
    subject: "ERROR: There was a problem.",
    to,
    from,
    html,
  };
  return mailer.sendMail(message);
}

async function updateLastMatchEmailSent(
  db: Object,
  users: Array<User>,
): Promise<any> {
  const lastMatchEmailSent = new Date().toISOString();
  const collection = db.graphConfig.topology.vertices.USERS;
  return Promise.all(
    users.map(async (user: User) => {
      const props = { lastMatchEmailSent };
      const { id } = user;
      return db.updateVertex(collection, id, props);
    }),
  );
}

export { emailAdminsPartialFailures, updateLastMatchEmailSent };
