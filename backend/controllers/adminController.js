const User = require("../models/userModel");
const Skill = require("../models/skillModel");
const { faker } = require("@faker-js/faker");

const showAllUsers = async (req, res) => {
  try {
    const allUsers = await User.find();
    res.status(200).json(allUsers);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const showAllSkills = async (req, res) => {
  try {
    const allSkills = await Skill.find();
    res.status(200).json(allSkills);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const addUser = async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res.status(200).json(newUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
    console.log(err);
  }
};

const addSkill = async (req, res) => {
  try {
    const newUser = await Skill.create(req.body);
    res.status(200).json(newUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
    console.log(err.message);
  }
};

const deleteAllUsers = async (req, res) => {
  try {
    if (req.body.confirmation === "YES") {
      await User.deleteMany({});
      console.log("Users collections is now empty.");
      res.status(200).json({ message: "Emptied the User collection." });
    } else {
      console.log("No confirmation");
      res.status(200).json({ message: "confirmation not provided !" });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
    console.log(err.message);
  }
};

const getAUser = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).send(error);
  }
};

const randm = (max) => {
  return Math.floor(Math.random() * max);
};

const setRandomSkillsAndMatches = async (req, res) => {
  try {
    let r0 = -1,
      r1 = -1,
      r2 = -1,
      r3 = 0,
      m;
    let othUser;
    let index = 0;

    const allUsers = await User.find();
    const allSkills = await Skill.find();

    console.log(allSkills);
    console.log(allUsers, "\n\n\n\n");

    for (const currUser of allUsers) {
      let theUser = await User.findOne({ _id: currUser._id });

      // console.log(theUser)

      while (r1 === r2 || r2 === r0 || r1 === r0) {
        r0 = randm(allSkills.length);
        r1 = randm(allSkills.length);
        r2 = randm(allSkills.length);
      }
      // console.log("r0 : ", r0)
      // console.log("r1 : ", r1)
      // console.log("r2 : ", r2)

      theUser.skills = [];
      theUser.interests.push(allSkills[r0]._id);
      theUser.skills.push(allSkills[r1]._id);
      theUser.skills.push(allSkills[r2]._id);
      r0 = -1;
      r1 = -1;
      r2 = -1;

      theUser.notifications = [];
      theUser.notifications.push("notification number one");
      theUser.notifications.push("notification number two");

      while (true) {
        m = randm(allUsers.length);
        if (m === index) continue;
        const probM = await User.findOne({ _id: allUsers[m]._id });
        if (
          !probM.matches.find((request) => request === theUser._id) &&
          !probM.matchRequests.find((request) => request === theUser._id)
        ) {
          theUser.matchRequests.push(probM._id);
          break;
        }
      }

      await theUser.save();
      theUser = await User.findOne({ _id: currUser._id });

      if (theUser.matches.length < 1) {
        while (r3 === index) {
          r3 = randm(allUsers.length);
          const already = await User.findOne({ _id: allUsers[r3]._id });
          if (theUser.matchRequests.find((request) => request === already._id))
            r3 = index;
        }

        // console.log("r3 : ", r3)
        othUser = await User.findOne({ _id: allUsers[r3]._id });

        theUser.matches.push(othUser._id);
        othUser.matches.push(theUser._id);

        // console.log(othUser)
        await othUser.save();
      }

      await theUser.save();

      index++;
      r3 = index;
    }
    res.status(200).json({ message: "task completed" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const addSkillsBulk = async (req, res) => {
  try {
    const { skills } = req.body;

    if (!Array.isArray(skills)) {
      return res.status(400).json({ message: "Expected array of skills" });
    }

    // Filter valid skills and check for existing ones
    const validSkills = skills
      .filter((skill) => typeof skill.name === "string" && skill.name.trim())
      .map((skill) => ({ name: skill.name.trim() }));

    const existingSkills = await Skill.find({
      name: { $in: validSkills.map((s) => s.name) },
    });

    const newSkills = validSkills.filter(
      (skill) =>
        !existingSkills.some((existing) => existing.name === skill.name)
    );

    if (newSkills.length === 0) {
      return res.status(400).json({ message: "All skills already exist" });
    }

    const createdSkills = await Skill.insertMany(newSkills);
    res.status(201).json(createdSkills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const generateFakeUsers = async (req, res) => {
  try {
    const { count } = req.body;
    const allSkills = await Skill.find();

    if (allSkills.length < 20) {
      return res.status(400).json({
        message: "Need at least 20 skills in database to generate users",
      });
    }

    const fakeUsers = [];
    for (let i = 0; i < count; i++) {
      const userSkills = [];
      const userInterests = [];

      // Select 10 random skills
      while (userSkills.length < 10) {
        const skill = allSkills[Math.floor(Math.random() * allSkills.length)];
        if (!userSkills.includes(skill._id)) {
          userSkills.push(skill._id);
        }
      }

      // Select 10 interest different from skills
      while (userInterests.length < 10) {
        const interest =
          allSkills[Math.floor(Math.random() * allSkills.length)]._id;
        if (
          !userSkills.includes(interest) &&
          !userInterests.includes(interest)
        ) {
          userInterests.push(interest);
        }
      }

      fakeUsers.push({
        fname: faker.person.firstName(),
        lname: faker.person.lastName(),
        email: faker.internet.email(),
        password: "tesT123456@", // Default password
        username: faker.internet.userName().replace(/[^a-zA-Z0-9]/g, ""),
        bio: faker.lorem.sentence(),
        skills: userSkills,
        interests: userInterests,
      });
    }

    const createdUsers = await User.insertMany(fakeUsers);
    res.status(201).json({
      message: `Created ${count} fake users`,
      users: createdUsers,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      stack: err.stack,
    });
  }
};

module.exports = {
  showAllSkills,
  showAllUsers,
  addUser,
  addSkill,
  deleteAllUsers,
  getAUser,
  setRandomSkillsAndMatches,
  addSkillsBulk,
  generateFakeUsers,
};
