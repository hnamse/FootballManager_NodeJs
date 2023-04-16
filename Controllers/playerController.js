const Players = require('../models/Players');
const Nations = require('../models/Nations');

let clubData = [
  { "id": "1", "name": "Arsenal" },
  { "id": "2", "name": "Manchester United" },
  { "id": "3", "name": "Chelsea" },
  { "id": "4", "name": "Manchester City" },
  { "id": "5", "name": "PSG" },
  { "id": "6", "name": "Inter Milan" },
  { "id": "7", "name": "Real Madrid" },
  { "id": "8", "name": "Barcelona" }
]

let positionData = [
  
  { "id": "1", "name": "Defenders" },
  { "id": "2", "name": "Midfielders" },
  { "id": "3", "name": "Forwards" },
  {"id" : "4", "name": "Goalkeeper"},
]

class playerController {

  index(req, res, next) {

    var currentPage = req.query.page;
    var limit = req.query.limit;
    var offset = (currentPage - 1) * limit;


    let nationList = [];

    Nations.find({}, function (err, nations) {
      if (err) {
        console.error(err);
        return;
      }
      nations.forEach(function (nation) {
        nationList.push(nation);
      });
    });

    const filterList = {
      nationValue: "",
      clubValue: "",
      positionValue: "",
      goalsValue: "",
      isCaptainValue: "",
    }



   const options = {
      page: req.query.page || 1,
      limit: 3,
      populate: 'nation',
    };

    Players.paginate({}, options).then(function (result) {
      res.render('players', {
        title: 'The list of Players',
        filterList: filterList,
        nationList: nationList,
        players: result.docs,
        clubList: clubData,
        positionList: positionData,
        userId: req.user,
        pages: result.totalPages,
        current: result.page
      });
    }).catch(next)
  }

  create = async (req, res, next) => {
    try {
      // Tìm nation tương ứng với nationName
      const nation = await Nations.findOne({ name: req.body.nation });
      const name = req.body.name;
      const image = req.body.image;
      const club = req.body.club;
      const position = req.body.position;
      const goals = req.body.goals;
      const isCaptain = req.body.isCaptain;

      const playerName = await Players.findOne({ name: name });
      console.log(playerName);
      if (playerName) {
        res.redirect('/players')
      }

      // Tạo đối tượng player mới
      const player = new Players({
        name,
        image,
        club,
        position,
        goals,
        isCaptain,
        nation: nation ? nation.image : "" // Sử dụng ID của nation tìm được ở trên
      });

      await player.save()
        .then(() => res.redirect('/players'))
        .catch(error => {
          console.log(error)
        });
    } catch (error) {
      console.log(error);
    }
  };

  formEdit(req, res, next) {

    let nationList = [];

    Nations.find({}, function (err, nations) {
      if (err) {
        console.error(err);
        return;
      }
      nations.forEach(function (nation) {
        nationList.push(nation);
      });
    });

    const playerId = req.params.playerId;
    let viewsData = {};
    Players.findById(playerId)
      .then((player) => {
        res.render('editPlayer', {
          title: 'The detail of Player',
          player: player,
          clubList: clubData,
          positionList: positionData,
          nationList: nationList,
          userId: req.user
        });
      })
      .catch(next);
  }

  edit = async (req, res, next) => {

    const nation = await Nations.findOne({ name: req.body.nation });
    const name = req.body.name;
    const image = req.body.image;
    const club = req.body.club;
    const position = req.body.position;
    const goals = req.body.goals;
    const isCaptain = req.body.isCaptain;
    // Tạo đối tượng player mới
    const player = {
      name,
      image,
      club,
      position,
      goals,
      isCaptain,
      nation: nation.image // Sử dụng ID của nation tìm được ở trên
    };

    await Players.updateOne({ _id: req.params.playerId }, player)
      .then(() => {
        res.redirect('/players')
      })
      .catch(next)
  }

  delete(req, res, next) {
    Players.findByIdAndDelete({ _id: req.params.playerId })
      .then(() => res.redirect('/players'))
      .catch(next);
  }

  filter = async (req, res, next) => {

    let nation = req.body.nationFilterValue;
    let club = req.body.clubFilterValue;
    let position = req.body.positionFilterValue;
    let goals = req.body.goalsFilterValue;
    let captain = req.body.isCaptainFilterValue;

    const filterList = {
      nationValue: nation,
      clubValue: club,
      positionValue: position,
      goalsValue: goals,
      isCaptainValue: captain,
    }

    let nationList = [];

    Nations.find({}, function (err, nations) {
      if (err) {
        console.error(err);
        return;
      }
      nations.forEach(function (nation) {
        nationList.push(nation);
      });
    });

    await Players.find({}).populate('nation')
      .then((players) => {

        if (club) {
          players = players.filter((element) => element["club"] === club);
        }
        if (position) {
          players = players.filter((element) => element["position"] === position);
        }
        if (goals) {
          players = players.filter((element) => {
            goals = Number(goals);
            let goal = element["goals"];
            if (goals === 0) {

              if (goal >= 0 && goal <= 3) {
                return true
              } else {
                return false
              }

            } else if (goals === 3) {

              if (goal > 3 && goal <= 5) {
                return true
              } else {
                return false
              }

            } else if (goals === 5) {

              if (goal > 5 && goal <= 10) {
                return true
              } else {
                return false
              }

            } else if (goals === 10) {

              if (goal > 10) {
                return true
              } else {
                return false
              }

            } else {
              return true
            }
          });
        }
        if (captain) {
          players = players.filter((element) => String(element["isCaptain"]).toLowerCase() === captain);
        }
        if (nation) {
          nation = nationList.find(element => element.name === nation);
          players = players.filter((element) => element["nation"] === nation.image);
        }

        res.render('players', {
          title: 'The list of Players',
          filterList: filterList,
          nationList: nationList,
          players: players,
          clubList: clubData,
          positionList: positionData,
          userId: req.user
        });
      }).catch(next)
  }

  // ajax
  async search(req, res, next) {
    // let payload= req.body.payload.trim();
    // console.log(payload);
    // let search = Players.find({name: {}})
    let q = req.query.q;
    const mongoQuery = {
      $or: [
        { name: { $regex: q || '', $options: 'i' } },
      ],
    };

    try {
      const data = await Players.find({ name: { $regex: q || '', $options: 'i' } });
      let view = {
        players: data
      }

      // res.send(data);
      res.render('page', view)
    } catch (error) {
      console.log(error);
    }


  }
};
module.exports = new playerController;