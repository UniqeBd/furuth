# Furuth - Static E-commerce Website

A complete, modern, and responsive e-commerce website built with HTML, Tailwind CSS, and JavaScript. Features a fully functional admin panel, shopping cart, and product management system using localStorage - no backend required!

## 🌟 Features

### Frontend Features
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional design using Tailwind CSS
- **Dark/Light Mode**: Toggle between themes with persistent settings
- **Product Catalog**: Responsive grid layout displaying all products
- **Product Details**: Individual product pages with detailed information
- **Shopping Cart**: Add, remove, and manage cart items with quantity controls
- **Search & Filter**: Real-time product search and sorting capabilities
- **Smooth Animations**: Hover effects, transitions, and loading states

### Admin Features
- **Secure Login**: Username: `Shoaib`, Password: `AllAhu@3211`
- **Product Management**: Add new products with name, price, image, and description
- **Image Management**: Simple image path system (just enter `images/filename.jpg`)
- **Real-time Updates**: Products appear instantly on the website after adding
- **Product Overview**: View and manage all existing products
- **Data Persistence**: All data stored in localStorage

### Technical Features
- **No Backend Required**: 100% client-side application
- **GitHub Pages Ready**: Deploy directly to GitHub Pages
- **localStorage Integration**: Persistent data storage in browser
- **SEO Friendly**: Semantic HTML structure and meta tags
- **Performance Optimized**: Minimal dependencies, fast loading

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Web server (for local development) or GitHub Pages for deployment

### Installation

1. **Clone or Download** the project files to your computer
2. **Add Product Images** to the `/images` folder
3. **Open** `index.html` in a web browser or deploy to a web server

### File Structure
```
furuth-website/
├── index.html          # Homepage
├── products.html       # Products listing page
├── product.html        # Individual product details
├── cart.html          # Shopping cart page
├── admin.html         # Admin panel
├── js/
│   ├── main.js        # Main application logic
│   └── admin.js       # Admin panel functionality
├── css/
│   └── style.css      # Custom styles
└── images/            # Product images folder
    ├── README.md      # Images folder instructions
    └── *.jpg          # Your product images
```

## 🛠️ Usage

### For Store Owners (Admin)

1. **Access Admin Panel**:
   - Go to `admin.html`
   - Login with credentials: `Shoaib` / `AllAhu@3211`

2. **Add Products**:
   - Fill in product name, price, and description
   - For image path, enter: `images/your-image.jpg`
   - Click "Add Product"
   - Product appears instantly on the website

3. **Manage Products**:
   - View all products in the admin panel
   - Delete products as needed
   - Click "View" to see how products appear to customers

### For Customers

1. **Browse Products**:
   - Visit the homepage or products page
   - Use search to find specific items
   - Sort by name or price

2. **View Product Details**:
   - Click on any product to see details
   - Choose quantity and add to cart

3. **Manage Cart**:
   - View cart items on the cart page
   - Update quantities or remove items
   - See order total with tax and shipping

## 📁 Adding Product Images

1. **Prepare Images**:
   - Use JPG, PNG, or WebP format
   - Recommended size: 500x500 pixels or larger
   - Keep file sizes under 2MB

2. **Upload Images**:
   - Place image files in the `/images` folder
   - Use descriptive names: `laptop-gaming.jpg`, `phone-blue.png`

3. **Reference in Admin**:
   - When adding products, use path: `images/your-filename.jpg`
   - The system automatically loads images from the images folder

## 🌐 GitHub Pages Deployment

1. **Create Repository**:
   - Create a new repository on GitHub
   - Upload all project files

2. **Enable GitHub Pages**:
   - Go to repository Settings
   - Scroll to "Pages" section
   - Select "Deploy from a branch"
   - Choose "main" branch
   - Click "Save"

3. **Access Your Site**:
   - Your site will be available at: `https://yourusername.github.io/repository-name`
   - All images and functionality will work automatically

## 🎨 Customization

### Colors and Branding
- Edit the `tailwind.config` section in HTML files
- Modify the primary color from `#3b82f6` to your brand color
- Update the logo text "Furuth" to your brand name

### Layout and Styling
- Customize `css/style.css` for additional styling
- Modify HTML structure as needed
- All styles use Tailwind CSS classes for easy customization

### Admin Credentials
- Change admin credentials in `js/admin.js`
- Update the `login()` method with new username/password

## 📱 Browser Compatibility

- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **Mobile Browsers**: Responsive design works on all devices

## 🔧 Technical Details

### Dependencies
- **Tailwind CSS**: Loaded via CDN for styling
- **JavaScript**: Vanilla JS, no frameworks required
- **localStorage**: For data persistence

### Data Storage
- Products stored in `localStorage` under key: `furuth_products`
- Cart items stored in `localStorage` under key: `furuth_cart`
- Admin login state stored in `sessionStorage`
- Theme preference stored in `localStorage`

### Security Notes
- This is a demo/portfolio project
- Admin credentials are hardcoded for demonstration
- For production use, implement proper backend authentication
- localStorage data persists only in the browser

## 🎯 Use Cases

- **Portfolio Projects**: Showcase web development skills
- **Learning**: Study modern web development techniques
- **Prototyping**: Quick e-commerce website prototypes
- **Small Business**: Simple product showcase (with payment integration)
- **Educational**: Teaching web development concepts

## 🤝 Contributing

Feel free to fork this project and make improvements:
- Add new features
- Improve the design
- Fix bugs
- Add more payment integration
- Enhance mobile experience

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 📞 Support

For questions or issues:
- Review the code comments for implementation details
- Check browser console for any JavaScript errors
- Ensure all files are uploaded correctly
- Verify image paths match the files in `/images` folder

## 🎉 Demo Data

The admin panel includes a "Add Sample Products" button to populate the store with demo data for testing purposes.

---

**Built with ❤️ using HTML, Tailwind CSS, and JavaScript**

*Ready for GitHub Pages deployment and 100% client-side functionality!*