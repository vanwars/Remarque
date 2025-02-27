const { AuthenticationError } = require("apollo-server-express");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc"); // If dealing with UTC dates
const timezone = require("dayjs/plugin/timezone"); // For timezone support
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("UTC");

const { User, Spread, GridItem, PlannerItem } = require("../models");
const { signToken } = require("../utils/auth");
const {
  sevenDay,
  createPlanner,
  createGridTemplate,
} = require("../utils/weekCalc");

const resolvers = {
  Query: {
    // QCed
    user: async (parent, args, context) => {
      const user = await User.findById(context.user._id)
        .populate([
          {
            path: "spreads",
            populate: "gridItems ",
          },
          {
            path: "spreads",
            populate: "plannerItems ",
          },
          {
            path: "spreads",
            populate: "layout",
          },
        ])
        .sort({ monday: -1 });
      return user;

      //throw new AuthenticationError("Not logged in");
    },
    // QCed
    allUsers: async (parent, args, context) => {
      const users = await User.find({});

      return users;
    },
    spread: async (parent, { date }, context) => {
      if (context.user) {
        const day = new Date(date);
        const monday = dayjs().day(1);
        const spread = await Spread.findOne()
          .where("monday")
          .equals(monday)
          .where("userId")
          .equals(context.user._id);
        return spread;
      }
    },
    spreadById: async (parent, { _id }, context) => {
      if (context.user) {
        return await Spread.findById(_id).populate([
          {
            path: "gridItems",
            populate: "_id",
          },
          {
            path: "plannerItems",
            populate: "_id",
          },
          {
            path: "layout",
            populate: "_id",
          },
        ]);
      }
    },
    userSpreads: async (parent, args, context) => {
      if (context.user) {
        return await Spread.find().where("userId").equals(context.user._id);
      }
    },
  },
  Mutation: {
    // Create new user
    // QCed
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      const today = dayjs().tz();
      const dayOfWeek = today.day(); // Sunday = 0, Monday = 1, ..., Saturday = 6
      const recentMonday = today
        .subtract(dayOfWeek === 0 ? 6 : dayOfWeek - 1, "day")
        .startOf("day");
      const week = sevenDay(recentMonday);
      const plannerItems = await createPlanner(week);
      const { gridItems, layoutItems } = await createGridTemplate();
      let layout = layoutItems;
      const userId = user._id;

      const monday = recentMonday.toDate();
      const spread = await Spread.create({
        monday,
        plannerItems,
        gridItems,
        layout,
        userId,
      });
      const firstSpread = spread._id;

      await User.findByIdAndUpdate(user._id, {
        $push: { spreads: spread },
      }).populate("spreads");

      return { token, user, firstSpread };
    },
    // Add new spread as a subdocument to user model
    // Takes in 3 parameters:
    // -Referenced date for making the new spread
    // -Planner items that the user has saved
    // -Location of the grid items on the page
    addSpread: async (parent, { date }, context) => {
      if (context.user) {
        const refDate = dayjs(date);
        const mondayRef = refDate.day(1).startOf("day");
        const week = sevenDay(mondayRef);
        const plannerItems = await createPlanner(week);
        const { gridItems, layoutItems } = await createGridTemplate();
        let layout = layoutItems;
        const userId = context.user._id;

        let monday = mondayRef.toDate();
        const spread = await Spread.create({
          monday,
          plannerItems,
          gridItems,
          layout,
          userId,
        });

        await User.findByIdAndUpdate(context.user._id, {
          $push: { spreads: spread },
        });

        return spread;
      }

      throw new AuthenticationError("Not logged in");
    },

    addPlannerItem: async (parent, { spreadId, body, scheduled, status, collection }, context) => {
      if (context.user) {
        // Set items in exact order of model
        const plannerItem = await PlannerItem.create({ body, scheduled, status, collection });

        await Spread.findByIdAndUpdate(spreadId, {
          $push: { plannerItems: plannerItem },
        });

        return plannerItem;
      }
    },
    // QCed

    addGridItem: async (
      parent,
      { title, body, x, y, h, w, i, spreadId },
      context
    ) => {
      if (context.user) {
        // Set items in exact order of model
        const gridItem = await GridItem.create({ title, body, x, y, h, w, i });

        await Spread.findByIdAndUpdate(spreadId, {
          $push: { gridItems: gridItem },
        });

        return gridItem;
      }

      throw new AuthenticationError("Not logged in");
    },
    updateGridItem: async (parent, args, context) => {
      if (context.user) {
        return await GridItem.findByIdAndUpdate(args._id, args, {
          new: true,
        });
      }

      throw new AuthenticationError("Not logged in");
    },
    updatePlannerItem: async (parent, { _id, body, scheduled, status, collection }, context) => {
      if (context.user) {
        return await PlannerItem.findByIdAndUpdate(
          _id,
          {
            $set: {
              body: body,
              scheduled: scheduled, 
              status: status, 
              collection: collection
            },
          },
          {
            new: true,
          }
        );
      }

      throw new AuthenticationError("Not logged in");
    },
    updateUser: async (parent, args, context) => {
      if (context.user) {
        return await User.findByIdAndUpdate(context.user._id, args, {
          new: true,
        });
      }

      throw new AuthenticationError("Not logged in");
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const token = signToken(user);

      return { token, user };
    },
  },
};

module.exports = resolvers;
