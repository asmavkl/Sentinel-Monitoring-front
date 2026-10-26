export const ApplicationHealthStatus = {
  Unknown: 1,
  Normal: 2,
  Warning: 3,
  Critical: 4,
  OutOfService: 5,
  // Backward compatibility aliases
  Up: 2, // Maps to Normal
  Down: 4, // Maps to Critical
} as const;

export type ApplicationHealthStatus =
  (typeof ApplicationHealthStatus)[keyof typeof ApplicationHealthStatus];

export const ExecutionStatus = {
  Success: 1,
  Failed: 2,
  Timeout: 3,
  ConnectionError: 4,
  Unauthorized: 5,
} as const;

export type ExecutionStatus = (typeof ExecutionStatus)[keyof typeof ExecutionStatus];

export const ApplicationPriority = {
  Critical: 1,
  Important: 2,
  Low: 3,
} as const;

export type ApplicationPriority =
  (typeof ApplicationPriority)[keyof typeof ApplicationPriority];

export const CheckType = {
  HttpRequest: 1,
  Http: 1, // Alias for backward compatibility
  SqlQuery: 2,
  DatabaseQuery: 2, // Alias for backward compatibility
  Redis: 3,
  MongoDb: 4,
} as const;

export type CheckType = (typeof CheckType)[keyof typeof CheckType];

export const HttpMethod = {
  GET: 1,
  POST: 2,
  PUT: 3,
  DELETE: 4,
} as const;

export type HttpMethod = (typeof HttpMethod)[keyof typeof HttpMethod];

export const ResultType = {
  Scalar: 1,
  StatusCount: 2,
  Dataset: 3,
} as const;

export type ResultType = (typeof ResultType)[keyof typeof ResultType];

export const RedisOperationType = {
  Ping: 1,
  Info: 2,
  Get: 3,
  KeyExists: 4,
  ListLength: 5,
} as const;

export type RedisOperationType =
  (typeof RedisOperationType)[keyof typeof RedisOperationType];

export const MongoOperationType = {
  Ping: 1,
  CollectionCount: 2,
  Query: 3,
} as const;

export type MongoOperationType =
  (typeof MongoOperationType)[keyof typeof MongoOperationType];

export const CredentialType = {
  SqlServer: 1,
  Redis: 2,
  MongoDb: 3,
  PostgreSql: 4,
  MySql: 5,
  Oracle: 6,
  Snmp: 7,
} as const;

export type CredentialType = (typeof CredentialType)[keyof typeof CredentialType];

export const DatabaseHealthQueryCategory = {
  Connection: 1,
  Availability: 2,
  Performance: 3,
  Capacity: 4,
  Storage: 5,
} as const;

export type DatabaseHealthQueryCategory =
  (typeof DatabaseHealthQueryCategory)[keyof typeof DatabaseHealthQueryCategory];

export const CriteriaOperator = {
  Equals: 1,
  LessThan: 2,
  LessThanOrEqual: 3,
  GreaterThan: 4,
  GreaterThanOrEqual: 5,
  Between: 6,
} as const;

export type CriteriaOperator = (typeof CriteriaOperator)[keyof typeof CriteriaOperator];

export const SnmpVersion = {
  V1: 1,
  V2c: 2,
  V3: 3,
} as const;

export type SnmpVersion = (typeof SnmpVersion)[keyof typeof SnmpVersion];

export const SnmpAuthenticationProtocol = {
  Md5: 1,
  Sha1: 2,
  Sha256: 3,
  Sha384: 4,
  Sha512: 5,
} as const;

export type SnmpAuthenticationProtocol =
  (typeof SnmpAuthenticationProtocol)[keyof typeof SnmpAuthenticationProtocol];

export const SnmpPrivacyProtocol = {
  Des: 1,
  Aes128: 2,
  Aes192: 3,
  Aes256: 4,
} as const;

export type SnmpPrivacyProtocol = (typeof SnmpPrivacyProtocol)[keyof typeof SnmpPrivacyProtocol];

export const MonitoringMethod = {
  Snmp: 1,
} as const;

export type MonitoringMethod = (typeof MonitoringMethod)[keyof typeof MonitoringMethod];

export const MetricType = {
  Number: 1,
  Percentage: 2,
  Duration: 3,
  Count: 4,
  Boolean: 5,
} as const;

export type MetricType = (typeof MetricType)[keyof typeof MetricType];

export const AggregationType = {
  Average: 1,
  Sum: 2,
  Min: 3,
  Max: 4,
  Latest: 5,
} as const;

export type AggregationType = (typeof AggregationType)[keyof typeof AggregationType];

export const AlertThresholdMode = {
  ConsecutiveCount: 1,
  Duration: 2,
} as const;

export type AlertThresholdMode = (typeof AlertThresholdMode)[keyof typeof AlertThresholdMode];

export const NotificationChannel = {
  Email: 1,
} as const;

export type NotificationChannel = (typeof NotificationChannel)[keyof typeof NotificationChannel];

export const AlertIncidentStatus = {
  Open: 1,
  Resolved: 2,
} as const;

export type AlertIncidentStatus = (typeof AlertIncidentStatus)[keyof typeof AlertIncidentStatus];

export const NotificationDeliveryStatus = {
  Pending: 1,
  Processing: 2,
  Sent: 3,
  Failed: 4,
  Suppressed: 5,
  DeliveryUnconfirmed: 6,
  Sending: 7,
} as const;

export type NotificationDeliveryStatus =
  (typeof NotificationDeliveryStatus)[keyof typeof NotificationDeliveryStatus];
