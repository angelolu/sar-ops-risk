import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useEffect, useRef } from 'react';
import { addRxPlugin, createRxDatabase } from 'rxdb';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { wrappedKeyCompressionStorage } from 'rxdb/plugins/key-compression';
import { RxDBMigrationSchemaPlugin } from 'rxdb/plugins/migration-schema';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv';
import { v4 as uuidv4 } from 'uuid';
import { getTimeoutDefault } from './helperFunctions';
addRxPlugin(RxDBMigrationSchemaPlugin);

if (__DEV__) {
  addRxPlugin(RxDBDevModePlugin);
}

const fileSchema = {
  version: 1,
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
  },
  required: ['id', 'created']
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

export const RxDBContext = createContext();

export const RxDBProvider = ({ children }) => {
  const filesDBRef = useRef(null);
  const dbReady = useRef(false);

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
      } catch (error) {
        console.error('Initialization error:', error);
        // Handle initialization errors (e.g., display an error message)
      }
    };

    initialize();
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

  const createFile = async () => {
    await waitForInit();
    return new Promise(async (resolve) => {
      const newFileUUID = uuidv4();
      const myDocument = await filesDBRef.current.files.insert({
        id: newFileUUID,
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      });
      resolve(newFileUUID);
    });
  }

  const deleteFile = async (document) => {
    // todo: also delete all related rows in other tables
    await waitForInit();
    await document.remove();
  }

  const getFiles = async () => {
    await waitForInit();
    return await filesDBRef.current.files.find({
      selector: {},
      sort: [{ updated: 'asc' }]
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

  const getData = async (key) => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      // error reading value
    }
  };

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
        lastStart: ``,
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
      createCommsQueueMessage
    }}>
      {children}
    </RxDBContext.Provider>
  );
}
