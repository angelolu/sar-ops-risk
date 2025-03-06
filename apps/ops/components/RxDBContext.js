import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, getFirestore, where } from 'firebase/firestore';
import React, { createContext, useEffect, useRef, useState } from 'react';
import { addRxPlugin, createRxDatabase } from 'rxdb';
import { RxDBCleanupPlugin } from 'rxdb/plugins/cleanup';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { wrappedKeyCompressionStorage } from 'rxdb/plugins/key-compression';
import { RxDBLeaderElectionPlugin } from 'rxdb/plugins/leader-election';
import { RxDBMigrationSchemaPlugin } from 'rxdb/plugins/migration-schema';
import { replicateFirestore } from 'rxdb/plugins/replication-firestore';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv';
import { v4 as uuidv4 } from 'uuid';
import { useFirebase } from './FirebaseContext';
import { getAsyncStorageData, getTimeoutDefault, saveAsyncStorageData } from './helperFunctions';

addRxPlugin(RxDBMigrationSchemaPlugin);
addRxPlugin(RxDBLeaderElectionPlugin);
addRxPlugin(RxDBCleanupPlugin);

if (__DEV__) {
  addRxPlugin(RxDBDevModePlugin);
}

const fileSchema = {
  version: 2,
  keyCompression: true,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100 // <- the primary key must have maxLength
    },
    fileName: {
      type: 'string'
    },
    incidentName: {
      type: 'string'
    },
    incidentNumber: {
      type: 'string'
    },
    opPeriod: {
      type: 'string'
    },
    created: {
      type: 'string',
    },
    updated: {
      type: 'string',
    },
    commsCallsign: {
      type: 'string',
    },
    commsName: {
      type: 'string',
    },
    commsFrequency: {
      type: 'string',
    },
    type: {
      type: 'string',
      enum: ['local', 'cloud']
    },
  },
  required: ['id', 'created', 'type']
}

const teamSchema = {
  version: 2,
  keyCompression: true,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100
    },
    fileId: {
      type: 'string',
      maxLength: 100
    },
    name: { type: 'string', maxLength: 12 },
    type: { type: 'string', maxLength: 12 },
    status: { type: 'string', maxLength: 100 },
    assignment: {
      type: 'string',
      maxLength: 100
    },
    flagged: { type: 'boolean' },
    lastStart: { type: 'string' },
    lastTimeRemaining: { type: 'number' },
    isRunning: { type: 'boolean' },
    editing: { type: 'boolean' },
    removed: { type: 'boolean' },
    created: {
      type: 'string',
    },
  },
  required: ['id', 'fileId']
}

const logSchema = {
  version: 1,
  keyCompression: true,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100
    },
    fileId: {
      type: 'string',
      maxLength: 100
    },
    fromTeam: {
      type: 'string',
      maxLength: 100
    },
    toTeam: {
      type: 'string',
      maxLength: 100
    },
    type: {
      type: 'number',
    },
    message: { type: 'string' },
    created: { type: 'string' },
  },
  required: ['id', 'fileId', 'fromTeam']
}

const peopleSchema = {
  version: 1,
  keyCompression: true,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100
    },
    fileId: {
      type: 'string',
      maxLength: 100
    },
    teamId: {
      type: 'string',
      maxLength: 100
    },
    name: {
      type: 'string'
    },
    email: {
      type: 'string'
    },
    agency: {
      type: 'string'
    },
    role: {
      type: 'string'
    },
    type: {
      type: 'string'
    },
    idNumber: {
      type: 'string'
    },
    arrivalTime: {
      type: 'string'
    },
    departureTime: {
      type: 'string'
    },
    created: {
      type: 'string'
    },
    medCert: {
      type: 'string'
    },
    status: {
      type: 'string'
    },
    additionalAttrs: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    phone: {
      type: 'string'
    },
    notes: {
      type: 'string'
    },
    trackingURL: {
      type: 'string'
    }
  },
  required: ['id', 'fileId', 'created']
};

const equipmentSchema = {
  version: 0,
  keyCompression: true,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100
    },
    fileId: {
      type: 'string',
      maxLength: 100
    },
    name: {
      type: 'string'
    },
    quantity: {
      type: 'number'
    },
    agency: {
      type: 'string'
    },
    teamId: {
      type: 'array',
      items: {
        type: 'string',
        maxLength: 100
      }
    },
    created: {
      type: 'string'
    },
    notes: {
      type: 'string'
    },
  },
  required: ['id', 'fileId', 'created']
};

const tasksSchema = {
  version: 1,
  keyCompression: true,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100
    },
    fileId: {
      type: 'string',
      maxLength: 100
    },
    name: {
      type: 'string'
    },
    teamId: {
      type: 'array',
      items: {
        type: 'string',
        maxLength: 100
      }
    },
    type: {
      type: 'string',
      maxLength: 25
    },
    location: {
      type: 'string'
    },
    created: {
      type: 'string'
    },
    flagged: { type: 'boolean' },
    completed: { type: 'boolean' },
    completedAt: { type: 'string' },
    completedBy: { type: 'string' },
    notes: {
      type: 'string'
    },
  },
  required: ['id', 'fileId', 'created']
};

const cluesSchema = {
  version: 2,
  keyCompression: true,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100
    },
    fileId: {
      type: 'string',
      maxLength: 100
    },
    name: {
      type: 'string'
    },
    foundByTeamId: {
      type: 'string',
      maxLength: 100
    },
    assignmentId: {
      type: 'string',
      maxLength: 100
    },
    description: {
      type: 'string'
    },
    location: {
      type: 'string'
    },
    state: {
      type: 'string',
      enum: ['New', 'Investigating', 'Escalated', 'Closed', 'Ignored']
    },
    flagged: {
      type: 'boolean'
    },
    created: {
      type: 'string'
    },
    notes: {
      type: 'string'
    }
  },
  required: ['id', 'fileId', 'created']
};

const commsQueueSchema = {
  version: 1,
  keyCompression: true,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100
    },
    fileId: {
      type: 'string',
      maxLength: 100
    },
    message: {
      type: 'string'
    },
    fromId: {
      type: 'string',
      maxLength: 100
    },
    toOpsTeam: {
      type: 'string',
    },
    toFieldTeamId: {
      type: 'string',
      maxLength: 100
    },
    type: {
      type: 'string',
      enum: ['General', 'Task', 'Clue', 'Resource']
    },
    subtype: {
      type: 'string',
    },
    relatedId: {
      type: 'string',
      maxLength: 100
    },
    created: {
      type: 'string'
    },
    acknowledgedTime: {
      type: 'string'
    },
    closed: {
      type: 'boolean'
    },
    response: {
      type: 'string'
    },
    flagged: {
      type: 'boolean'
    },
  },
  required: ['id', 'fileId', 'created', 'type']
};

const projectId = 'opsrisk-1b86f';

export const RxDBContext = createContext();

var filesReplicationState;
var teamsReplicationState;
var logsReplicationState;
var peopleReplicationState;
var equipmentReplicationState;
var tasksReplicationState;
var cluesReplicationState;
var commsQueueReplicationState;
var firebaseAuthObserver;

export const RxDBProvider = ({ children }) => {
  const filesDBRef = useRef(null);
  const dbReady = useRef(false);
  const fileSyncWatchdogInterval = useRef(false);

  const { waitForFirebaseReady } = useFirebase();

  const [isLeader, setIsLeader] = useState(false);
  const [replicationStatus, setReplicationStatus] = useState({ started: false, status: false });

  useEffect(() => {
    const initialize = async () => {
      try {
        let myDB;
        if (__DEV__) {
          myDB = await createRxDatabase({
            name: 'files_db',
            storage: wrappedKeyCompressionStorage({
              storage: wrappedValidateAjvStorage({
                storage: getRxStorageDexie()
              })
            })
          });
        } else {
          myDB = await createRxDatabase({
            name: 'files_db',
            storage: wrappedKeyCompressionStorage({
              storage: getRxStorageDexie()
            })
          });
        }

        await myDB.addCollections({
          files: {
            schema: fileSchema,
            migrationStrategies: {
              1: function (oldDoc) {
                // Added commsCallsign, commsName and commsFrequency
                return oldDoc;
              },
              2: function (oldDoc) {
                // Added type
                // Default to cloud
                oldDoc.type = 'cloud';
                return oldDoc;
              }
            }
          },
          teams: {
            schema: teamSchema,
            migrationStrategies: {
              1: function (oldDoc) {
                // Added removed field, because we want teams to still be able to be queried to resolve log entries
                return oldDoc;
              },
              2: function (oldDoc) {
                // Added created time
                oldDoc.created = new Date().toISOString();
                return oldDoc;
              }
            }
          },
          logs: {
            schema: logSchema,
            migrationStrategies: {
              1: function (oldDoc) {
                // Added type
                return oldDoc;
              },
            }
          },
          people: {
            schema: peopleSchema,
            migrationStrategies: {
              1: function (oldDoc) {
                // Renamed types
                return oldDoc;
              },
            }
          },
          equipment: {
            schema: equipmentSchema,
            migrationStrategies: {}
          },
          tasks: {
            schema: tasksSchema,
            migrationStrategies: {
              1: function (oldDoc) {
                // Added completedAt field
                return oldDoc;
              }
            }
          },
          clues: {
            schema: cluesSchema,
            migrationStrategies: {
              1: function (oldDoc) {
                // added state strings
                return oldDoc;
              },
              2: function (oldDoc) {
                // added name field
                return oldDoc;
              },
            }
          },
          commsQueue: {
            schema: commsQueueSchema,
            migrationStrategies: {
              1: function (oldDoc) {
                // added state strings
                return oldDoc;
              }
            }
          }
        });

        filesDBRef.current = myDB;
        dbReady.current = true;

        myDB.waitForLeadership()
          .then(() => {
            // console.log(`I'm the leader!`);
            setIsLeader(true);
          });

      } catch (error) {
        console.error('Initialization error:', error);
        // Handle initialization errors (e.g., display an error message)
      }
    };

    initialize();
  }, []);

  const resetWatchdog = () => {
    if (fileSyncWatchdogInterval.current) clearTimeout(fileSyncWatchdogInterval.current);
    fileSyncWatchdogInterval.current = setTimeout(() => {
      setReplicationStatus({ started: true, status: false });
    }, 1000);
  };

  const startWatchdog = () => {
    Promise.allSettled([
      filesReplicationState ? filesReplicationState.awaitInSync() : false,
      teamsReplicationState ? teamsReplicationState.awaitInSync() : false,
      logsReplicationState ? logsReplicationState.awaitInSync() : false,
      peopleReplicationState ? peopleReplicationState.awaitInSync() : false,
      equipmentReplicationState ? equipmentReplicationState.awaitInSync() : false,
      tasksReplicationState ? tasksReplicationState.awaitInSync() : false,
      cluesReplicationState ? cluesReplicationState.awaitInSync() : false,
      commsQueueReplicationState ? commsQueueReplicationState.awaitInSync() : false
    ]).then(() => {
      resetWatchdog();
      setReplicationStatus({ started: true, status: true });
      // Wait for 500ms before checking again
      setTimeout(() => {
        startWatchdog();
      }, 250);
    })
  };

  const stopWatchdog = () => {
    if (fileSyncWatchdogInterval.current) clearTimeout(fileSyncWatchdogInterval.current);
    setReplicationStatus({ started: false, status: false });
  };

  const restartSync = () => {
    console.log("Restarting sync service");
    if (firebaseAuthObserver) firebaseAuthObserver();
    Promise.all([waitForInit(), waitForFirebaseReady()]).then((values) => {
      firebaseAuthObserver = onAuthStateChanged(getAuth(), (user) => {
        // TODO: Stop using this for authentication
        if (user && user.email.endsWith('@ca-sar.org')) {
          const firestoreDatabase = getFirestore();

          // Sync all file attributes
          if (!filesReplicationState) {
            const firestoreFilesCollection = collection(firestoreDatabase, 'rx-files');
            filesReplicationState = replicateFirestore(
              {
                replicationIdentifier: `https://firestore.googleapis.com/${projectId}`,
                collection: filesDBRef.current.files,
                firestore: {
                  projectId,
                  database: firestoreDatabase,
                  collection: firestoreFilesCollection
                },
                pull: {},
                push: {
                  filter: (item) => item.type === 'cloud'
                },
                live: true,
                serverTimestampField: 'serverTimestamp'
              }
            );
          }

          // Get files to be synced
          getAsyncStorageData("syncedFiles").then((syncedFiles) => {
            const files_to_sync = syncedFiles ? syncedFiles : [];

            Promise.allSettled([
              teamsReplicationState ? teamsReplicationState.cancel() : false,
              logsReplicationState ? logsReplicationState.cancel() : false,
              peopleReplicationState ? peopleReplicationState.cancel() : false,
              equipmentReplicationState ? equipmentReplicationState.cancel() : false,
              tasksReplicationState ? tasksReplicationState.cancel() : false,
              cluesReplicationState ? cluesReplicationState.cancel() : false,
              commsQueueReplicationState ? commsQueueReplicationState.cancel() : false
            ]).then((ret) => {
              // console.log("Replications stopped.");
              teamsReplicationState = null;
              logsReplicationState = null;
              peopleReplicationState = null;
              equipmentReplicationState = null;
              tasksReplicationState = null;
              cluesReplicationState = null;
              commsQueueReplicationState = null;
              stopWatchdog();
              if (files_to_sync.length > 0) {
                const firestoreTeamsCollection = collection(firestoreDatabase, 'rx-teams');
                teamsReplicationState = replicateFirestore(
                  {
                    replicationIdentifier: `https://firestore.googleapis.com/${projectId}`,
                    collection: filesDBRef.current.teams,
                    firestore: {
                      projectId,
                      database: firestoreDatabase,
                      collection: firestoreTeamsCollection
                    },
                    pull: {
                      filter: [
                        where('fileId', 'in', files_to_sync)
                      ]
                    },
                    push: {
                      filter: (item) => files_to_sync.includes(item.fileId)
                    },
                    live: true,
                    serverTimestampField: 'serverTimestamp'
                  }
                );
                teamsReplicationState.error$.subscribe(err => {
                  console.error("Teams error:", err);
                });

                const firestoreLogsCollection = collection(firestoreDatabase, 'rx-logs');
                logsReplicationState = replicateFirestore(
                  {
                    replicationIdentifier: `https://firestore.googleapis.com/${projectId}`,
                    collection: filesDBRef.current.logs,
                    firestore: {
                      projectId,
                      database: firestoreDatabase,
                      collection: firestoreLogsCollection
                    },
                    pull: {
                      filter: [
                        where('fileId', 'in', files_to_sync)
                      ]
                    },
                    push: {
                      filter: (item) => files_to_sync.includes(item.fileId)
                    },
                    live: true,
                    serverTimestampField: 'serverTimestamp'
                  }
                );
                logsReplicationState.error$.subscribe(err => {
                  console.error("Logs error:", err);
                });

                const firestorePeopleCollection = collection(firestoreDatabase, 'rx-people');
                peopleReplicationState = replicateFirestore(
                  {
                    replicationIdentifier: `https://firestore.googleapis.com/${projectId}`,
                    collection: filesDBRef.current.people,
                    firestore: {
                      projectId,
                      database: firestoreDatabase,
                      collection: firestorePeopleCollection
                    },
                    pull: {
                      filter: [
                        where('fileId', 'in', files_to_sync)
                      ]
                    },
                    push: {
                      filter: (item) => files_to_sync.includes(item.fileId)
                    },
                    live: true,
                    serverTimestampField: 'serverTimestamp'
                  }
                );
                peopleReplicationState.error$.subscribe(err => {
                  console.error("People error:", err);
                });

                const firestoreEquipmentCollection = collection(firestoreDatabase, 'rx-equipment');
                equipmentReplicationState = replicateFirestore(
                  {
                    replicationIdentifier: `https://firestore.googleapis.com/${projectId}`,
                    collection: filesDBRef.current.equipment,
                    firestore: {
                      projectId,
                      database: firestoreDatabase,
                      collection: firestoreEquipmentCollection
                    },
                    pull: {
                      filter: [
                        where('fileId', 'in', files_to_sync)
                      ]
                    },
                    push: {
                      filter: (item) => files_to_sync.includes(item.fileId)
                    },
                    live: true,
                    serverTimestampField: 'serverTimestamp'
                  }
                );
                equipmentReplicationState.error$.subscribe(err => {
                  console.error("Equipment error:", err);
                });

                const firestoreTasksCollection = collection(firestoreDatabase, 'rx-tasks');
                tasksReplicationState = replicateFirestore(
                  {
                    replicationIdentifier: `https://firestore.googleapis.com/${projectId}`,
                    collection: filesDBRef.current.tasks,
                    firestore: {
                      projectId,
                      database: firestoreDatabase,
                      collection: firestoreTasksCollection
                    },
                    pull: {
                      filter: [
                        where('fileId', 'in', files_to_sync)
                      ]
                    },
                    push: {
                      filter: (item) => files_to_sync.includes(item.fileId)
                    },
                    live: true,
                    serverTimestampField: 'serverTimestamp'
                  }
                );
                tasksReplicationState.error$.subscribe(err => {
                  console.error("Tasks error:", err);
                });

                const firestoreCluesCollection = collection(firestoreDatabase, 'rx-clues');
                cluesReplicationState = replicateFirestore(
                  {
                    replicationIdentifier: `https://firestore.googleapis.com/${projectId}`,
                    collection: filesDBRef.current.clues,
                    firestore: {
                      projectId,
                      database: firestoreDatabase,
                      collection: firestoreCluesCollection
                    },
                    pull: {
                      filter: [
                        where('fileId', 'in', files_to_sync)
                      ]
                    },
                    push: {
                      filter: (item) => files_to_sync.includes(item.fileId)
                    },
                    live: true,
                    serverTimestampField: 'serverTimestamp'
                  }
                );
                cluesReplicationState.error$.subscribe(err => {
                  console.error("Clues error:", err);
                });

                const firestoreCommsQueueCollection = collection(firestoreDatabase, 'rx-commsQueue');
                commsQueueReplicationState = replicateFirestore(
                  {
                    replicationIdentifier: `https://firestore.googleapis.com/${projectId}`,
                    collection: filesDBRef.current.commsQueue,
                    firestore: {
                      projectId,
                      database: firestoreDatabase,
                      collection: firestoreCommsQueueCollection
                    },
                    pull: {
                      filter: [
                        where('fileId', 'in', files_to_sync)
                      ]
                    },
                    push: {
                      filter: (item) => files_to_sync.includes(item.fileId)
                    },
                    live: true,
                    serverTimestampField: 'serverTimestamp'
                  }
                );
                commsQueueReplicationState.error$.subscribe(err => {
                  console.error("CommsQueue error:", err);
                });

                startWatchdog();

                Promise.all([teamsReplicationState.awaitInSync(), logsReplicationState.awaitInSync(), peopleReplicationState.awaitInSync(), equipmentReplicationState.awaitInSync(), tasksReplicationState.awaitInSync(), cluesReplicationState.awaitInSync(), commsQueueReplicationState.awaitInSync()]).then((ret) => {
                  console.log("Sync complete.", ret);
                  saveAsyncStorageData("readyFiles", files_to_sync);
                });
              }
            });
          });
        } else {
          stopWatchdog();
          // Stop all replications
          if (filesReplicationState || teamsReplicationState || logsReplicationState || peopleReplicationState || equipmentReplicationState || tasksReplicationState || cluesReplicationState || commsQueueReplicationState) {
            Promise.allSettled([
              filesReplicationState ? filesReplicationState.remove() : false,
              teamsReplicationState ? teamsReplicationState.remove() : false,
              logsReplicationState ? logsReplicationState.remove() : false,
              peopleReplicationState ? peopleReplicationState.remove() : false,
              equipmentReplicationState ? equipmentReplicationState.remove() : false,
              tasksReplicationState ? tasksReplicationState.remove() : false,
              cluesReplicationState ? cluesReplicationState.remove() : false,
              commsQueueReplicationState ? commsQueueReplicationState.remove() : false
            ]).then((ret) => {
              // console.log("Replications stopped.", ret);
              // Delete all the files where file.type === 'cloud'
              let deletedFileIds = [];
              filesDBRef.current.files.find().exec().then((files) => {
                for (const file of files) {
                  if (file.type === 'cloud') {
                    deletedFileIds.push(file.id);
                    file.incrementalRemove();
                  }
                }
                // Remove all the teams, logs, people, equipment, tasks, clues, and commsQueue entries associated with the file
                Promise.allSettled([
                  filesDBRef.current.teams.find({
                    selector: { fileId: { $in: deletedFileIds } }
                  }).incrementalRemove(),

                  filesDBRef.current.logs.find({
                    selector: { fileId: { $in: deletedFileIds } }
                  }).incrementalRemove(),

                  filesDBRef.current.people.find({
                    selector: { fileId: { $in: deletedFileIds } }
                  }).incrementalRemove(),

                  filesDBRef.current.equipment.find({
                    selector: { fileId: { $in: deletedFileIds } }
                  }).incrementalRemove(),

                  filesDBRef.current.tasks.find({
                    selector: { fileId: { $in: deletedFileIds } }
                  }).incrementalRemove(),

                  filesDBRef.current.clues.find({
                    selector: { fileId: { $in: deletedFileIds } }
                  }).incrementalRemove(),

                  filesDBRef.current.commsQueue.find({
                    selector: { fileId: { $in: deletedFileIds } }
                  }).incrementalRemove()
                ]).then(() => {
                  // Run cleanup so the files are actually deleted and don't get deleted on the remote if the user signs in again
                  Promise.allSettled([
                    filesDBRef.current.files.cleanup(0),
                    filesDBRef.current.teams.cleanup(0),
                    filesDBRef.current.logs.cleanup(0),
                    filesDBRef.current.people.cleanup(0),
                    filesDBRef.current.equipment.cleanup(0),
                    filesDBRef.current.tasks.cleanup(0),
                    filesDBRef.current.clues.cleanup(0),
                    filesDBRef.current.commsQueue.cleanup(0),
                    saveAsyncStorageData("readyFiles", []),
                    saveAsyncStorageData("syncedFiles", [])
                  ]).then(() => {
                    filesReplicationState = null;
                    teamsReplicationState = null;
                    logsReplicationState = null;
                    peopleReplicationState = null;
                    equipmentReplicationState = null;
                    tasksReplicationState = null;
                    cluesReplicationState = null;
                    commsQueueReplicationState = null;
                  });
                });
              });
            });
          }
        }
      });
    });
  }

  useEffect(() => {
    restartSync();
  }, []);

  const waitForInit = () => {
    return new Promise((resolve) => {
      const intervalId = setInterval(() => {
        if (dbReady.current) {
          clearInterval(intervalId);
          resolve();
        }
      }, 100); // Check for initialization every 100ms
    });
  }

  const createFile = async (cloud = false) => {
    await waitForInit();
    return new Promise(async (resolve) => {
      const newFileUUID = uuidv4();
      const myDocument = await filesDBRef.current.files.insert({
        id: newFileUUID,
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        type: cloud ? 'cloud' : 'local'
      });
      resolve(newFileUUID);
    });
  }

  const deleteFile = async (document) => {
    // todo: also delete all related rows in other tables
    await waitForInit();
    await Promise.allSettled([
      filesDBRef.current.teams.find({
        selector: { fileId: document.id }
      }).remove(),

      filesDBRef.current.logs.find({
        selector: { fileId: document.id }
      }).remove(),

      filesDBRef.current.people.find({
        selector: { fileId: document.id }
      }).remove(),

      filesDBRef.current.equipment.find({
        selector: { fileId: document.id }
      }).remove(),

      filesDBRef.current.tasks.find({
        selector: { fileId: document.id }
      }).remove(),

      filesDBRef.current.clues.find({
        selector: { fileId: document.id }
      }).remove(),

      filesDBRef.current.commsQueue.find({
        selector: { fileId: document.id }
      }).remove()
    ]);
    console.log(`Removed all data related to ${document.id}`);
    await document.remove();
  }

  const getFiles = async () => {
    await waitForInit();
    return await filesDBRef.current.files.find({
      selector: {},
      sort: [{ updated: 'desc' }]
    });
  }

  const getFileByID = async (fileId) => {
    await waitForInit();
    try {
      const file = await filesDBRef.current.files.findOne({
        selector: { id: fileId }
      });
      return file;
    } catch (error) {
      console.error("Error fetching file:", error);
      return null;
    }
  }

  const createTeam = async (fileId, type = "", status = "") => {
    await waitForInit();
    return new Promise(async (resolve) => {
      const newTeamUUID = uuidv4();
      const myDocument = await filesDBRef.current.teams.insert({
        id: newTeamUUID,
        fileId: fileId, // Associate team with the file
        name: '',
        type: type,
        status: status,
        flagged: false,
        lastTimeRemaining: await getTimeoutDefault(),
        isRunning: false,
        created: new Date().toISOString(),
      });
      resolve(myDocument);
    });
  }

  const getTeamsByFileId = async (fileId) => {
    await waitForInit();
    return await filesDBRef.current.teams.find({
      selector: {
        fileId: fileId,
        //removed: { $ne: true }
      },
      sort: [{ name: 'asc' }]
    });
  }

  const removeTeam = async (team) => {
    await waitForInit();
    // Unassign all people from the team
    const peopleQuery = filesDBRef.current.people.find({
      selector: {
        teamId: team.id,
      }
    });
    await peopleQuery.incrementalPatch({ teamId: "" });
    // Unassign all equipment from the team
    const equipmentQuery = filesDBRef.current.equipment.find({
      selector: {
        teamId: {
          $in: [team.id]  // Matches if array contains teamId
        }
      }
    });
    await equipmentQuery.incrementalModify((docData) => {
      // remove team.id from the teamId array
      docData.teamId = docData.teamId.filter((id) => id !== team.id);
      return docData;
    });
    // Unassign team from all queued tasks
    const tasksQuery = filesDBRef.current.tasks.find({
      selector: {
        teamId: {
          $in: [team.id]  // Matches if array contains teamId
        }
      }
    });
    await tasksQuery.incrementalModify((docData) => {
      // remove team.id from the teamId array
      docData.teamId = docData.teamId.filter((id) => id !== team.id);
      return docData;
    });
    // We don't actually delete the team, we just mark it as removed so it can still be queried for logs
    await team.incrementalPatch({ removed: true });
  }


  const deleteDocument = async (document) => {
    await waitForInit();
    await document.remove();
  }

  const getLogsByFileId = async (fileId) => {
    await waitForInit();
    return await filesDBRef.current.logs.find({
      selector: {
        fileId: fileId,
      },
      sort: [{ created: 'desc' }]
    });
  }

  const getLastRadioLog = async (fileId, teamID) => {
    await waitForInit();
    // Construct the selector to filter logs by fileId, teamID, and type
    const selector = {
      fileId: fileId,
      $or: [
        { fromTeam: teamID },
        { toTeam: teamID }
      ],
      type: 2
    };

    // Find the logs matching the selector and sort by created date in descending order
    return await filesDBRef.current.logs.findOne({
      selector: selector,
      sort: [{ created: 'desc' }]
    });
  }

  const createLog = async (fileId, logInfo) => {
    await waitForInit();
    return new Promise(async (resolve) => {
      const newTeamUUID = uuidv4();
      const myDocument = await filesDBRef.current.logs.insert({
        ...{
          id: newTeamUUID,
          fileId: fileId, // Associate team with the file
        },
        ...logInfo
      });
      resolve(myDocument);
    });
  }

  const createPerson = async (fileId, personObj) => {
    await waitForInit();
    return new Promise(async (resolve) => {
      const newPersonUUID = uuidv4();
      const myDocument = await filesDBRef.current.people.insert({
        ...{
          id: newPersonUUID,
          fileId: fileId,
          created: new Date().toISOString()
        }, ...personObj
      });
      resolve(myDocument);
    });
  }

  const getPeopleByTeamId = async (teamId) => {
    await waitForInit();
    return await filesDBRef.current.people.find({
      selector: {
        teamId: teamId,
      },
      sort: [{ name: 'asc' }]
    });
  }

  const getPeopleByFileId = async (fileId) => {
    await waitForInit();
    return await filesDBRef.current.people.find({
      selector: {
        fileId: fileId,
      },
      sort: [
        { agency: 'desc' },
        { name: 'asc' },
      ]
    });
  }

  const createEquipment = async (fileId, equipmentObj) => {
    await waitForInit();
    return new Promise(async (resolve) => {
      const newPersonUUID = uuidv4();
      const myDocument = await filesDBRef.current.equipment.insert({
        ...{
          id: newPersonUUID,
          fileId: fileId,
          created: new Date().toISOString()
        }, ...equipmentObj
      });
      resolve(myDocument);
    });
  }

  const getEquipmentByTeamId = async (teamId) => {
    await waitForInit();
    return await filesDBRef.current.equipment.find({
      selector: {
        teamId: {
          $in: [teamId]  // Matches if array contains teamId
        }
      },
      sort: [{ name: 'asc' }]
    });
  }

  const getEquipmentByFileId = async (fileId) => {
    await waitForInit();
    return await filesDBRef.current.equipment.find({
      selector: {
        fileId: fileId,
      },
      sort: [
        { agency: 'desc' },
        { name: 'asc' }
      ]
    });
  }

  const createAssignment = async (fileId, assignmentObj = {}) => {
    await waitForInit();
    return new Promise(async (resolve) => {
      const newAssignmentUUID = uuidv4();
      const myDocument = await filesDBRef.current.tasks.insert({
        ...{
          id: newAssignmentUUID,
          fileId: fileId,
          created: new Date().toISOString()
        }, ...assignmentObj
      });
      resolve(myDocument);
    });
  }

  const getAssignmentById = async (assignmentId) => {
    await waitForInit();
    return await filesDBRef.current.tasks.findOne({
      selector: {
        id: assignmentId
      }
    });
  }

  const getAssignmentsByTeamId = async (teamId) => {
    await waitForInit();
    return await filesDBRef.current.tasks.find({
      selector: {
        teamId: {
          $in: [teamId]  // Matches if array contains teamId
        }
      },
      sort: [{ name: 'asc' }]
    });
  }

  const getAssignmentsByFileId = async (fileId) => {
    await waitForInit();
    return await filesDBRef.current.tasks.find({
      selector: {
        fileId: fileId,
      },
      sort: [
        { name: 'asc' }
      ]
    });
  }

  const getCluesByFileId = async (fileId) => {
    await waitForInit();
    return await filesDBRef.current.clues.find({
      selector: {
        fileId: fileId,
      },
      sort: [
        { created: 'desc' }
      ]
    });
  }

  const createClue = async (fileId, clueObj) => {
    await waitForInit();
    return new Promise(async (resolve) => {
      const newClueUUID = uuidv4();
      const myDocument = await filesDBRef.current.clues.insert({
        ...{
          id: newClueUUID,
          fileId: fileId,
          created: new Date().toISOString()
        }, ...clueObj
      });
      resolve(myDocument);
    });
  }

  const getClueById = async (clueId) => {
    await waitForInit();
    return await filesDBRef.current.clues.findOne({
      selector: {
        id: clueId
      }
    });
  }

  const getCommsQueueMessagesByFileId = async (fileId) => {
    await waitForInit();
    return await filesDBRef.current.commsQueue.find({
      selector: {
        fileId: fileId,
      },
      sort: [
        { created: 'desc' }
      ]
    });
  }

  const createCommsQueueMessage = async (fileId, messageObj) => {
    await waitForInit();
    return new Promise(async (resolve) => {
      const newUUID = uuidv4();
      const myDocument = await filesDBRef.current.commsQueue.insert({
        ...{
          id: newUUID,
          fileId: fileId,
          created: new Date().toISOString()
        }, ...messageObj
      });
      resolve(myDocument);
    });
  }

  return (
    <RxDBContext.Provider value={{
      isLeader,
      restartSync,
      createFile,
      getFiles,
      deleteFile,
      getFileByID,
      createTeam,
      removeTeam,
      getTeamsByFileId,
      deleteDocument,
      getLogsByFileId,
      createLog,
      getLastRadioLog,
      createPerson,
      getPeopleByTeamId,
      getPeopleByFileId,
      createEquipment,
      getEquipmentByTeamId,
      getEquipmentByFileId,
      createAssignment,
      getAssignmentById,
      getAssignmentsByTeamId,
      getAssignmentsByFileId,
      getCluesByFileId,
      createClue,
      getClueById,
      getCommsQueueMessagesByFileId,
      createCommsQueueMessage,
      replicationStatus
    }}>
      {children}
    </RxDBContext.Provider>
  );
}
