const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');

const playerSchema = new mongoose.Schema({
        name:{
            type: String,
            require:true,
            unique: true
        },
        image:{
            type: String,
            require: true
        },
        club:{
            type:String,
            require:true
        },
        position:{
            type:String,
            require:true
        },
        goals:{
            type:Number,
            require:true
        },
        isCaptain:{
            type:Boolean,
            require:true
        },
        nation: {
            type: String,
            require:true
          }
    },
    {
        timestamps: true
    });

    playerSchema.plugin(paginate);
module.exports = mongoose.model('Players', playerSchema);

