const { validationResult, body } = require("express-validator");
const createError = require("http-errors");
const { Request, Response } = require("express");
const ContentLibrary = require("../../models/contentLibrary");

// @route to get all contents
// @access public
// @desc get all contents

const allContent = async (req = Request, res = Response) => {
  try {
    const allContents = await ContentLibrary.find();
    if (!allContents) {
      return res.status(404).json({
        status: 404, message: "No content found",
      });
    }
    return res.status(200).json({
      status: 200, message: "All contents",
      data:allContents,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500, message: "Internal server error",
      error,
    });
  }
};

// @route to get single content
// @access public
// @desc get single content

const singleContent = async (req = Request, res = Response) => {
  try {
    const { id } = req.query;
    const singleContent = await ContentLibrary.findById(id);
    if (!singleContent) {
      return res.status(404).json({
        status: 404, message: "Content not found",
      });
    }
    return res.status(200).json({
      status: 200, message: "Single content",
      data:singleContent,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500, message: "Internal server error",
      error,
    });
  }
};

module.exports = { allContent, singleContent };
