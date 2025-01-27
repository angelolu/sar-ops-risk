import React, { createContext, useEffect, useState, useRef } from 'react';
import { Platform } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { addRxPlugin, createRxDatabase } from 'rxdb';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { RxDBMigrationSchemaPlugin } from 'rxdb/plugins/migration-schema';
import { wrappedKeyCompressionStorage } from 'rxdb/plugins/key-compression';
addRxPlugin(RxDBMigrationSchemaPlugin);
addRxPlugin(RxDBDevModePlugin);

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

export const RxDBContext = createContext();

export const RxDBProvider = ({ children }) => {
  const filesDBRef = useRef(null);
  const dbReady = useRef(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        const myDB = await createRxDatabase({
          name: 'files_db',
          storage: wrappedKeyCompressionStorage({
            storage: wrappedValidateAjvStorage({
              storage: getRxStorageDexie()
            })
          })
        });

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

  const createTeam = async (fileId) => {
    await waitForInit();
    let timeoutDefault = await getData("timeout-seconds");
    return new Promise(async (resolve) => {
      const newTeamUUID = uuidv4();
      const myDocument = await filesDBRef.current.teams.insert({
        id: newTeamUUID,
        fileId: fileId, // Associate team with the file
        name: '',
        type: '',
        status: '',
        flagged: false,
        lastStart: ``,
        lastTimeRemaining: timeoutDefault || 3600,
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
      sort: [{ created: 'desc' }]
    });
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
    let timeoutDefault = await getData("timeout-seconds");
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

  return (
    <RxDBContext.Provider value={{
      createFile,
      getFiles,
      deleteFile,
      getFileByID,
      createTeam,
      getTeamsByFileId,
      deleteDocument,
      getLogsByFileId,
      createLog,
      getLastRadioLog
    }}>
      {children}
    </RxDBContext.Provider>
  );
}
