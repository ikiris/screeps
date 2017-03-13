module.exports = {
    run: function (roomName) {

        let room = Game.rooms[roomName];
        if (room.controller == undefined) {
            return;
        }
        if (room.memory.hostiles > 5 && room.memory.hostiles % 10 != 0 ) {
            room.memory.hostile++;
            return
        }

        let hostiles = room.find(FIND_HOSTILE_CREEPS);

        if (hostiles.length > 0) {
            room.memory.hostile = -1;
            let username = hostiles[0].owner.username;
            Game.notify(`User ${username} spotted in room ${roomName}`);
            /*
            if (room.memory.towerids.length == 0) {
                towers = room.find(
                    FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
                towers.foreach()
            }
            */
            let towers = room.find(
                FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
            towers.forEach(tower => tower.attack(tower.findClosestByRange(FIND_HOSTILE_CREEPS)));
        } else {
            room.memory.hostile++;
        }
    }
};