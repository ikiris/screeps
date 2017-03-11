require('prototype-spawn')();
require('prototype-creep')();
let behavior = {};
behavior['harvest'] = require('behavior-harvest');
behavior['feed'] = require('behavior-feed');
let defendRoom = require('room-defend');


// game.rooms -- rooms i can see
// game.spawns -- all my spawns

module.exports = {
    loop: function () {
        //Defend rooms
        for (let room in Game.rooms) {
            defendRoom.run(room);
        }
        //Manage hostile missions

        //Do missions

        //Run Behavior
        for (let name in Game.creeps) {
            let creep = Game.creeps[name];
            if (creep == undefined) {
                this.reap.run(name);
                continue;
            }
            if (creep.spawning == true) {
                continue;
            }
            if (creep.ticksToLive == 1) {
                //I'm dying, reap me.

            }
            let bev = creep.memory.behavior;
            if (bev != undefined) {
                behavior[bev].run(creep);
                continue;
            }

            // Need Behavior
        }

        //Spawn Strategy
        for (let spawnName in Game.spawns) {
            let spawn = Game.spawns[spawnName];
            if (spawn.spawning != null) {
                continue;
            }
            let room = spawn.room;

            // get room needs
            if (room.memory.needs == undefined) {
                //determine needs
            }
            let needs = {};
            for (let need in room.memory.needs) {
                let hasneed = room.memory.hasneeds(need);
                let remain = need.val - hasneed;
                if (remain < 0) {
                    needs[need] = remain;
                }
            }

            // attempt to spawn highest need
            //spawn.fillNeed(need);
        }
    },
    reap: function(name) {
        let c = memory.creeps[name];
        if (c.need != undefined) {
            Game.rooms[c.need.room].hasneeds[c.need]--
        }
        delete memory.creeps[name];
    },
};