var listOfRoles = ['harvester', 'lorry', 'claimer', 'upgrader', 'repairer', 'builder', 'wallRepairer'];

// create a new function for StructureSpawn
StructureSpawn.prototype.spawnCreepsIfNecessary =
    function () {
        /** @type {Room} */
        let room = this.room;
        // find all creeps in room
        /** @type {Array.<Creep>} */
        let creepsInRoom = room.find(FIND_MY_CREEPS);
        
        // count the number of creeps alive for each role in this room
        // _.sum will count the number of properties in Game.creeps filtered by the
        //  arrow function, which checks for the creep being a specific role
        /** @type {Object.<string, number>} */
        let numberOfCreeps = {};
        for (let role of listOfRoles) {
            numberOfCreeps[role] = _.sum(creepsInRoom, (c) => c.memory.role == role && c.ticksToLive > 10);
        }
        let maxEnergy = room.energyCapacityAvailable;
        let name = undefined;

        if (this.memory.minCreeps == undefined) {
            this.memory.minCreeps = {
                'upgrader': 2,
                'harvester': 4,
                'repairer': 2,
                'builder': 2,
                'lorry': 0,
                'wallRepairer': 1
            }
        }
        // if no harvesters are left AND either no miners or no lorries are left
        //  create a backup creep
        if (numberOfCreeps['harvester'] == 0 && numberOfCreeps['lorry'] == 0) {
            // if there are still miners or enough energy in Storage left
            if (numberOfCreeps['miner'] > 0 ||
                (room.storage != undefined && room.storage.store[RESOURCE_ENERGY] >= 150 + 550)) {
                // create a lorry
                name = this.createLorry(150);
            }
            // if there is no miner and not enough energy in Storage left
            else {
                // create a harvester because it can work on its own
                name = this.createFallbackHarvester(room.energyAvailable);
            }
        }
        // if no backup creep is required
        else {
            // check if all sources have miners
            let sources = room.find(FIND_SOURCES);
            // iterate over all sources
            for (let source of sources) {
                // if the source has no miner
                if (!_.some(creepsInRoom, c => c.memory.role == 'miner' && c.memory.sourceId == source.id && c.ticksToLive > Math.max(23,( c.memory.firstmine ? (c.memory.firstmine - c.memory.firsttick + 2) : 0)))) {
                    // check whether or not the source has a container
                    /** @type {Array.StructureContainer} */
                    let containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
                        filter: s => s.structureType == STRUCTURE_CONTAINER
                    });
                    // if there is a container next to the source
                    if (containers.length > 0) {
                        // spawn a miner
                        name = this.createMiner(source.id);
                    }
                }
            }
        }

        // if none of the above caused a spawn command check for other roles
        if (name == undefined) {
            for (let role of listOfRoles) {
                // check for claim order
                if (role == 'claimer' && this.memory.claimRoom != undefined) {
                    // try to spawn a claimer
                    name = this.createClaimer(this.memory.claimRoom);
                    // if that worked
                    if (name != undefined && _.isString(name)) {
                        // delete the claim order
                        delete this.memory.claimRoom;
                    }
                }
                // if no claim order was found, check other roles
                else if (numberOfCreeps[role] < this.memory.minCreeps[role]) {
                    if (role == 'lorry') {
                        name = this.createLorry(min(500, maxEnergy));
                    }
                    if (role == 'harvester') {
                        name = this.createFallbackHarvester(maxEnergy);
                    }
                    else {
                        name = this.createCustomCreep(maxEnergy, role);
                    }
                    if (name != undefined) {
                        break;
                    }
                }
            }
        }
        
        // if none of the above caused a spawn command check for remoteMiners
        /** @type {Object.<string, number>} */
        let numberRemoteMiners = {};
        if (name == undefined) {
            // count the number of remote miners globally
            for (let roomName in this.memory.remoteMineRooms) {
                numberRemoteMiners[roomName] = _.sum(Game.creeps, (c) =>
                    c.memory.role == 'remoteMiner' && c.memory.target == roomName)

                if (numberRemoteMiners[roomName] < this.memory.remoteMineRooms[roomName].sources.length) {
                    name = this.createRemoteMiner(maxEnergy, room.name);
                }
                if (!name == undefined) {
                    break;
                }
            }
        }

        // if none of the above caused a spawn command check for remoteMiners
        /** @type {Object.<string, number>} */
        let numberTruckers = {};
        if (name == undefined) {
            // count the number of remote miners globally
            for (let roomName in this.memory.remoteMineRooms) {
                if (!this.memory.remoteMineRooms[roomName].sources.length > 0) {
                    continue;
                }
                let asources = _(this.memory.remoteMineRooms[roomName].sources).filter(function (s) {
                    return _.some(Game.creeps, (c) => c.memory.role == 'remoteMiner' && c.memory.sourceid == s)
                }).valueOf();
                for (sid in asources) {
                    numberTruckers = _.sum(Game.creeps, (c) =>
                        c.memory.role == 'trucker' && c.memory.sourceid == sid);
                    if (numberTruckers < 2) {
                        name = this.createTrucker(energy, roomName, sid);
                        if (!name == undefined) {
                            break;
                        }
                    }
                }
                if (!name == undefined) {
                    break;
                }
            }
        }
        // print name to console if spawning was a success
/*
        if (name != undefined && _.isString(name)) {

            console.log(this.name + " spawned new creep: " + name + " (" + Game.creeps[name].memory.role + ")");
            for (let role of listOfRoles) {
                console.log(role + ": " + numberOfCreeps[role]);
            }

        }
        */
    };

// create a new function for StructureSpawn
StructureSpawn.prototype.createCustomCreep =
    function (energy, roleName) {
        // create a balanced body as big as possible with the given energy
        var numberOfParts = Math.floor(energy / 200);
        // make sure the creep is not too big (more than 50 parts)
        numberOfParts = Math.min(numberOfParts, Math.floor(50 / 3));
        var body = [];
        for (let i = 0; i < numberOfParts; i++) {
            body.push(WORK);
        }
        for (let i = 0; i < numberOfParts; i++) {
            body.push(CARRY);
        }
        for (let i = 0; i < numberOfParts; i++) {
            body.push(MOVE);
        }

        // create creep with the created body and the given role
        return this.createCreep(body, undefined, { role: roleName, working: false });
    };

// create a new function for StructureSpawn
StructureSpawn.prototype.createRemoteMiner =
    function (energy, target) {
        if (Game.rooms[target].memory.sources === undefined) {
            return false;
        }
        sources = _(sources).filter(function(s) {
            return !_.some(Game.creeps, c => c.memory.role == 'remoteMiner' && c.memory.sourceId == s)
            }).valueOf();

        let wc = Math.floor((energy - 100) / 100);
        let bigbody = [MOVE,MOVE,WORK, WORK, WORK, WORK, WORK]
        let body = Math.min(wc + 2,bigbody.length);
        //console.log("miner: size " + body);
        return this.createCreep(bigbody.slice(0, body), undefined,
            { role: 'remoteMiner', sourceId: sources[0], target: target, home: this.room.name});
    };

// create a new function for StructureSpawn
StructureSpawn.prototype.createClaimer =
    function (target) {
        return this.createCreep([CLAIM, MOVE], undefined, { role: 'claimer', target: target });
    };

// create a new function for StructureSpawn
StructureSpawn.prototype.createMiner =
    function (sourceId) {
        let wc = Math.floor((this.room.energyCapacityAvailable - 100) / 100);
        let bigbody = [MOVE, MOVE, WORK, WORK, WORK, WORK, WORK]
        let body = Math.min(wc + 2,bigbody.length);
        //console.log("miner: size " + body);
        if (this.memory.minCreeps['lorry'] == 0) {
            this.memory.minCreeps['lorry'] = 5;
            this.memory.minCreeps['harvester'] = 0;
        }
        return this.createCreep(bigbody.slice(0, body), undefined,
            { role: 'miner', sourceId: sourceId });
    };

// create a new function for StructureSpawn
StructureSpawn.prototype.createFallbackHarvester =
    function (energy) {
        //console.log("miner: size " + body);
        let wc = Math.floor(energy / 200);
        wc = Math.max(1, wc);
        let body = [];
        for (let i = 0; i < wc; i++) {
            body.push(WORK,CARRY,MOVE,MOVE);
        }
        return this.createCreep(body, undefined,
            { role: 'harvester', working: false});
    };

// create a new function for StructureSpawn
StructureSpawn.prototype.createLorry =
    function (energy) {
        // create a body with twice as many CARRY as MOVE parts
        var numberOfParts = Math.floor(energy / 150);
        // make sure the creep is not too big (more than 50 parts)
        numberOfParts = Math.min(numberOfParts, Math.floor(50 / 3));
        var body = [];
        for (let i = 0; i < numberOfParts * 2; i++) {
            body.push(CARRY);
        }
        for (let i = 0; i < numberOfParts; i++) {
            body.push(MOVE);
        }

        // create creep with the created body and the role 'lorry'
        return this.createCreep(body, undefined, { role: 'lorry', working: false });
    };
    
    
// create a new function for StructureSpawn
StructureSpawn.prototype.createTrucker =
    function (energy, roomName, sourceid) {
        let maxparts = 50;
        let base = [WORK,CARRY,MOVE,MOVE];
        let basecost = 250;
        
        let mod = [MOVE,CARRY];
        let modcost = 100;

        let maxenergy = 500;
        
        energy = math.Min(energy, maxenergy);

        if (memory.rooms[roomName].roaded == true) {
            mod.push(CARRY);
            modcost += 50;
            base = base.slice(0,base.length);
            basecost -= 50;
        }

        let body = base;
        let bodycost = basecost;
        while (true) {
            if ((bodycost + modcost) > energy || (body.length + mod.length) > maxparts) {
                break;
            }
            body.concat(mod);
            bodycost += modcost;
        }
        
        // create creep with the created body and the role 'lorry'
        return this.createCreep(body, undefined, { role: 'trucker', working: false, target: roomName, sourceid: sourceid, home: this.room.name });
    };
