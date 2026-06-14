import { relations } from "drizzle-orm";
import { auditLogs } from "./audit_logs";
import { clientConsents } from "./client_consents";
import { clients } from "./clients";
import { encryptionKeys } from "./encryption_keys";
import { organizations } from "./organizations";
import { sessionFiles } from "./session_files";
import { sessionNotes } from "./session_notes";
import { sessions } from "./sessions";
import { soapNotes } from "./soap_notes";
import { subscriptions } from "./subscriptions";
import { users } from "./users";

export const organizationsRelations = relations(organizations, ({ many, one }) => ({
  users:          many(users),
  clients:        many(clients),
  sessions:       many(sessions),
  auditLogs:      many(auditLogs),
  encryptionKey:  one(encryptionKeys, { fields: [organizations.id], references: [encryptionKeys.organizationId] }),
  subscription:   one(subscriptions,  { fields: [organizations.id], references: [subscriptions.organizationId] }),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, { fields: [users.organizationId], references: [organizations.id] }),
  sessions:     many(sessions),
  sessionNotes: many(sessionNotes),
  soapNotes:    many(soapNotes, { relationName: "therapistSoapNotes" }),
  signedSoapNotes: many(soapNotes, { relationName: "signedSoapNotes" }),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  organization:      one(organizations,  { fields: [clients.organizationId],      references: [organizations.id] }),
  assignedTherapist: one(users,          { fields: [clients.assignedTherapistId], references: [users.id] }),
  consents:          many(clientConsents),
  sessions:          many(sessions),
}));

export const clientConsentsRelations = relations(clientConsents, ({ one }) => ({
  client:       one(clients,       { fields: [clientConsents.clientId],       references: [clients.id] }),
  organization: one(organizations, { fields: [clientConsents.organizationId], references: [organizations.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  organization: one(organizations, { fields: [sessions.organizationId], references: [organizations.id] }),
  client:       one(clients,       { fields: [sessions.clientId],       references: [clients.id] }),
  therapist:    one(users,         { fields: [sessions.therapistId],    references: [users.id] }),
  note:         one(sessionNotes,  { fields: [sessions.id],             references: [sessionNotes.sessionId] }),
  soapNotes:    many(soapNotes),
  files:        many(sessionFiles),
}));

export const sessionNotesRelations = relations(sessionNotes, ({ one, many }) => ({
  session:      one(sessions,      { fields: [sessionNotes.sessionId],      references: [sessions.id] }),
  organization: one(organizations, { fields: [sessionNotes.organizationId], references: [organizations.id] }),
  therapist:    one(users,         { fields: [sessionNotes.therapistId],    references: [users.id] }),
  soapNotes:    many(soapNotes),
}));

export const soapNotesRelations = relations(soapNotes, ({ one }) => ({
  session:      one(sessions,      { fields: [soapNotes.sessionId],      references: [sessions.id] }),
  sessionNote:  one(sessionNotes,  { fields: [soapNotes.sessionNoteId],  references: [sessionNotes.id] }),
  organization: one(organizations, { fields: [soapNotes.organizationId], references: [organizations.id] }),
  therapist:    one(users,         { fields: [soapNotes.therapistId],    references: [users.id], relationName: "therapistSoapNotes" }),
  signedByUser: one(users,         { fields: [soapNotes.signedBy],       references: [users.id], relationName: "signedSoapNotes" }),
}));

export const sessionFilesRelations = relations(sessionFiles, ({ one }) => ({
  session:      one(sessions,      { fields: [sessionFiles.sessionId],      references: [sessions.id] }),
  organization: one(organizations, { fields: [sessionFiles.organizationId], references: [organizations.id] }),
  uploader:     one(users,         { fields: [sessionFiles.uploaderId],     references: [users.id] }),
}));

export const encryptionKeysRelations = relations(encryptionKeys, ({ one }) => ({
  organization: one(organizations, { fields: [encryptionKeys.organizationId], references: [organizations.id] }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  organization: one(organizations, { fields: [subscriptions.organizationId], references: [organizations.id] }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  organization: one(organizations, { fields: [auditLogs.organizationId], references: [organizations.id] }),
}));
