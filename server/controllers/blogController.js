exports.insertNewBlog = catchAsyncError(
    async (req, res, next) => {
      const err = await validationResult(req);
      if (!err.isEmpty()) {
        return res.status(400).json({ success: false, error: err });
      }

    //     console.log(req.user);
    owner = req.user._id;
  
      // req.body
      const {
        title,
        date,
        description,
      } = req.body;
  

      let files = req.files ? req.files.blogImages : null;
      console.log("files ", files);
      let blogImages = [];
  
      if (files) {
        for (const file of files) {
          const result = await cloudinary.uploader.upload(file.tempFilePath, {
            public_id: `${Date.now()}`,
            resource_type: "auto",
            folder: "images",
          });
  
          console.log("result ", result);
  
          if (result && result.secure_url) {
            blogImages.push(result.secure_url);
          } else {
            return res
              .status(500)
              .json({ message: "Failed to upload one or more images" });
          }
        }
      }
  
      console.log("product images ", blogImages);
  
      // save the data
      const data = await blogModel.create({
        imgUrlModelDBId: imgUrlModelDBId,
        title: title ? title.trim() : undefined,
        date: date,
        description: description,
      });
  
      // now, update the status of the ImgUrlModel document
      await ImgUrLModel.findByIdAndUpdate(
        imgUrlModelDBId,
        { isCurrentlyUsed: true },
        { new: true }
      );
  
      // response
      return res
        .status(200)
        .json({ success: true, message: "Data saved successfully.", data });
    }
  );