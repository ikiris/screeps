// import modules
require('prototype.creep');
require('prototype.tower');
require('prototype.spawn');

module.exports.loop = function() {
    // check for memory entries of died creeps by iterating over Memory.creeps
    for (let name in Memory.creeps) {
        // and checking if the creep is still alive
        if (Game.creeps[name] == undefined) {
            // if not, delete the memory entry
            delete Memory.creeps[name];
        }
    }

    // for each creeps
    for (let name in Game.creeps) {
        // run creep logic
        Game.creeps[name].runRole();
    }

    for (let roomName in Game.rooms) {
        let room = Game.rooms[roomName];
        if (room.name === undefined) {
            continue;
        }
        if (Game.time - room.memory.scanned < 5) {
            continue;
        }
        room.memory.scanned = Game.time;
        if (room.memory.sources === undefined) {
            let sources = room.find(FIND_SOURCES);
            room.memory.sources = sources.map(function(a) {return a.id;});
        }
        let exits = Game.map.describeExits(room.name);
        room.memory.exits = {};
        for (let exi in room.memory.exits) {
            if (Game.map.isRoomAvailable(exits[exi])) {
                room.memory.exits[exi] = exits[exi];
                memory.rooms[exits[exi]];
            }
        }
        let hostiles = room.find(FIND_HOSTILE_CREEPS)
        if (hostiles.length > 0) {
            room.memory.hostile = Game.time;
        }
    }
    // find all towers
    var towers = _.filter(Game.structures, s => s.structureType == STRUCTURE_TOWER);
    // for each tower
    for (let tower of towers) {
        // run tower logic
        tower.run();
    }
    for (let name in Memory.spawns) {
        // and checking if the spawn is still alive
        if (Game.spawns[name] == undefined) {
            // if not, delete the memory entry
            delete Memory.spawns[name];
            continue;
        }
    }
    // for each spawn
    for (let spawnName in Game.spawns) {
        let spawn = Game.spawns[spawnName];
        // run spawn logic
        spawn.spawnCreepsIfNecessary();
    }
};