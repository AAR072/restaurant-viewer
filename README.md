# Restaurant Finder

Welcome to the **Restaurant Finder**! This application helps users search, browse, and filter a large selection of restaurants by name, ID, coordinates, cost per person, and type. Designed for fast loading and usability, it is ideal for developers who appreciate efficiency and speed.

### Production Link
[Access the live site here](https://republic-168.pages.dev)

## Features

- **Search Functionality**: Users can search for restaurants by ID, name, or x and y coordinates. Results are displayed alphabetically by name and include all available information fields (name, review, cost per person, type, coordinates).
- **Browsing & Scrolling**: An intuitive interface allows users to scroll or browse through multiple results when the same search parameter yields several entries.
- **Performance Monitoring**: Each action (such as searching) logs the time taken to execute using `performance.now()`, giving users real-time feedback on search performance.
- **Information Table**: A secondary page displays a table listing all restaurants, sortable by each attribute for easier comparison.

### Bonus Features
1. **Filter Options**: Users can filter results to display only specific types of restaurants, price ranges, or review ranges.
2. **Grid Map**: A visual map displays each restaurant’s location, and clicking on a location shows the restaurant name.
3. **Go Frugal**: Given two x, y coordinates and a budget, find the cheapest route for a journey across four restaurant types, factoring in a travel cost of $0.5/km.
4. **Saving Fuel**: Given two x, y coordinates, determine the shortest path from point A to B while visiting up to six different types of restaurants of the user's choice.

## Technologies Used

- **Frontend**: HTML, CSS, and TypeScript for a responsive user interface.
- **Backend**: TypeScript handles data processing and search functionality, optimized for quick response times.
- **Performance Tracking**: Logs the duration of each action using `performance.now()` for real-time performance monitoring.

## Installation

1. Clone this repository to your local machine.
2. Open `index.html` in your browser to launch the app locally.

## Usage

1. **Search for Restaurants**: Enter search criteria in the search bar to locate specific restaurants by ID, name, or coordinates.
2. **View Details**: Scroll through or browse entries if multiple results match the search criteria.

## Development Notes

- **Data Storage**: Restaurants are stored in parallel arrays for efficient access.
- **Testing**: Performance is continuously logged and tested to ensure a smooth and efficient experience.

## License

This project is licensed under the GNU License.
