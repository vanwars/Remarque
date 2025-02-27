import React, { useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import Dragger from "./Dragger";
import { FaRegSave } from "react-icons/fa";

import { useMutation } from "@apollo/client";

import { UPDATE_GRIDITEM } from "../../utils/mutations";

const Card = ({ cardItems }) => {
  const [updateGridItem] = useMutation(UPDATE_GRIDITEM);

  const [titleState, setTitleState] = useState("");

  const [bodyState, setBodyState] = useState("");

  const handleSubmit = async () => {
    console.log(bodyState);
    try {
      const GridItem = await updateGridItem({
        variables: {
          id: cardItems._id,
          title: titleState,
          body: bodyState,
        },
      });
      console.log(GridItem);
    } catch (error) {
      console.log(error);
    }
  };

  const handleTitleChange = (e) => {
    const { value } = e.target;
    console.log(value);
    setTitleState(value);
  };

  const handleBodyChange = (e) => {
    const { value } = e.target;
    console.log(value);
    setBodyState(value);
  };

  function checkTitle(t) {
    if (!t) {
      return "";
    } else {
      return t;
    }
  }

  function checkBody(b) {
    if (!b) {
      return "";
    } else {
      return b;
    }
  }

  return (
    <div className="card card-compact card-bordered w-full h-full bg-base-100 shadow-xl">
      <Dragger />
      <textarea
        type="text"
        placeholder="Title"
        defaultValue={`${checkTitle(cardItems.title)}`}
        className="flex textarea textarea-bordered h-2 w-full text-center font-bold resize-none text-lg cursive-font"
        onChange={handleTitleChange}
      />
      <div>
        <TextareaAutosize
          minRows="9"
          maxRows="9"
          defaultValue={`${checkBody(cardItems.body)}`}
          placeholder="Type here"
          className="flex textarea h-full w-full resize-none p-4 text-xl handwriting-font"
          onChange={handleBodyChange}
        />
        <button className="justify-items-end" onClick={handleSubmit}>
          <FaRegSave />
        </button>
      </div>
    </div>
  );
};

export default Card;
