import { gql } from "@apollo/client";

export const QUERY_USER = gql`
  query User {
    user {
      _id
      spreads {
        _id
        monday
        plannerItems {
          _id
          body
          scheduled
        }
        gridItems {
          _id
          title
          body
          i
        }
        layout {
          _id
          i
          x
          y
          w
          h
          minW
          maxW
          minH
          maxH
        }
        userId
      }
      username
    }
  }
`;

export const QUERY_SPREAD = gql`
  query SpreadById($id: ID) {
    spreadById(_id: $id) {
      _id
      gridItems {
        _id
        title
        body
        i
      }
      monday
      plannerItems {
        _id
        body
        scheduled
        status
        collections
      }
      layout {
        _id
        i
        x
        y
        w
        h
        minW
        maxW
        minH
        maxH
        card
      }
      userId
    }
  }
`;

export const USER_SPREADS = gql`
  query UserSpreads {
    userSpreads {
      _id
      monday
    }
  }
`;
