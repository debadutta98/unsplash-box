# Unsplash Image Collection Manager

This project is a full-stack application that allows users to search for images on Unsplash, view image details, manage collections of images, and download images. It replicates the functionality of Unsplash's collection feature.

## Features

- **Homepage**: 
  - Search for images from Unsplash using keywords.
  - Display a list of images based on the search results.
- **Image Page**:
  - View image details including author and published date.
  - See a list of collections the image belongs to.
  - Add image to a collection.
  - Remove image from collections.
  - Download the image.
- **Collections Page**:
  - View and select existing collections.
  - View images within a selected collection.

## User Stories

1. **Homepage**
   - Users can search for images using keywords.
   - When `Enter` is pressed, show a list of images matching the keyword(s).
2. **Image Page**
   - Users can view the details of a selected image.
   - Display the author and published date of the image.
   - Show collections that the image belongs to.
   - Allow users to add the image to collections.
   - Provide a search and add functionality to add the image to collections it does not yet belong to.
   - Allow users to remove the image from collections.
   - Enable users to download the image.
3. **Collections Page**
   - Users can see and select existing collections.
   - Display a list of images within the selected collection.

## Technologies Used

- **Frontend**: React.js, HTML, CSS, Sass, [swr](https://swr.vercel.app/)
- **Backend**: Go
- **Database**: MongoDB
- **API**: Unsplash API
