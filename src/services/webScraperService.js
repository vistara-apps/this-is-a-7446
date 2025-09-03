/**
 * Web Scraper Service
 * 
 * This service provides functions for scraping data from websites.
 * It includes utilities for extracting data based on CSS selectors and scheduling scrape jobs.
 */

/**
 * Scrape data from a website based on CSS selectors
 * @param {Object} config - Scraping configuration
 * @returns {Promise<Object>} - The scraped data and metadata
 */
export async function scrapeWebsite(config) {
  const { url, selectors, options = {} } = config;
  
  if (!url) {
    throw new Error('URL is required for scraping');
  }
  
  try {
    // In a real implementation, this would make an API call to a backend service
    // For this demo, we'll simulate the scraping process
    
    // Simulate network request
    const response = await simulateFetch(url);
    
    // Extract data based on selectors
    const data = extractData(response.html, selectors);
    
    return {
      success: true,
      data,
      metadata: {
        url,
        timestamp: new Date().toISOString(),
        rowCount: data.length,
        selectors: Object.keys(selectors).length
      }
    };
  } catch (error) {
    console.error('Scraping error:', error);
    return {
      success: false,
      error: error.message,
      metadata: {
        url,
        timestamp: new Date().toISOString()
      }
    };
  }
}

/**
 * Schedule a recurring scrape job
 * @param {Object} config - Job configuration
 * @returns {Object} - The created job
 */
export function scheduleScrapingJob(config) {
  const { sourceId, url, selectors, schedule } = config;
  
  // In a real implementation, this would create a job in a backend service
  // For this demo, we'll return a simulated job object
  
  return {
    jobId: `job-${Date.now()}`,
    dataSourceId: sourceId,
    url,
    selectors,
    schedule,
    status: 'scheduled',
    nextRun: getNextRunTime(schedule),
    createdAt: new Date().toISOString()
  };
}

/**
 * Get the status of a scraping job
 * @param {string} jobId - The job ID
 * @returns {Object} - The job status
 */
export function getScrapingJobStatus(jobId) {
  // In a real implementation, this would fetch the job status from a backend service
  // For this demo, we'll return a simulated status
  
  return {
    jobId,
    status: 'completed',
    lastRun: new Date().toISOString(),
    nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    stats: {
      rowsScraped: 25,
      duration: '3.2s',
      success: true
    }
  };
}

/**
 * Cancel a scraping job
 * @param {string} jobId - The job ID
 * @returns {Object} - The cancellation result
 */
export function cancelScrapingJob(jobId) {
  // In a real implementation, this would cancel the job in a backend service
  // For this demo, we'll return a simulated result
  
  return {
    success: true,
    jobId,
    message: 'Job cancelled successfully'
  };
}

/**
 * Validate CSS selectors against a URL
 * @param {string} url - The URL to validate against
 * @param {Object} selectors - The CSS selectors to validate
 * @returns {Promise<Object>} - Validation results
 */
export async function validateSelectors(url, selectors) {
  try {
    // In a real implementation, this would make an API call to validate the selectors
    // For this demo, we'll simulate the validation
    
    // Simulate network request
    const response = await simulateFetch(url);
    
    // Validate each selector
    const results = {};
    Object.entries(selectors).forEach(([key, selector]) => {
      // Simulate selector validation
      const isValid = Math.random() > 0.2; // 80% chance of success
      const matchCount = isValid ? Math.floor(Math.random() * 20) + 1 : 0;
      
      results[key] = {
        valid: isValid,
        matches: matchCount,
        selector
      };
    });
    
    return {
      success: true,
      results,
      url
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      url
    };
  }
}

// Helper functions

/**
 * Simulate fetching a URL
 * @param {string} url - The URL to fetch
 * @returns {Promise<Object>} - The response
 */
async function simulateFetch(url) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
  
  // Check if URL is valid
  try {
    new URL(url);
  } catch (e) {
    throw new Error('Invalid URL');
  }
  
  // Simulate different responses based on URL
  if (url.includes('example.com')) {
    return {
      status: 200,
      html: generateExampleHtml('Example Website')
    };
  } else if (url.includes('news')) {
    return {
      status: 200,
      html: generateNewsHtml()
    };
  } else if (url.includes('blog')) {
    return {
      status: 200,
      html: generateBlogHtml()
    };
  } else if (url.includes('error')) {
    throw new Error('Failed to fetch URL');
  } else {
    return {
      status: 200,
      html: generateGenericHtml(url)
    };
  }
}

/**
 * Extract data from HTML based on selectors
 * @param {string} html - The HTML to extract from
 * @param {Object} selectors - The CSS selectors to use
 * @returns {Array} - The extracted data
 */
function extractData(html, selectors) {
  // In a real implementation, this would use a DOM parser to extract data
  // For this demo, we'll generate simulated data based on the selectors
  
  const data = [];
  const itemCount = Math.floor(Math.random() * 10) + 5; // 5-15 items
  
  for (let i = 0; i < itemCount; i++) {
    const item = {};
    
    Object.keys(selectors).forEach(key => {
      if (key.includes('title')) {
        item[key] = generateTitle(i);
      } else if (key.includes('description') || key.includes('content')) {
        item[key] = generateDescription(i);
      } else if (key.includes('date')) {
        item[key] = generateDate(i);
      } else if (key.includes('link') || key.includes('url')) {
        item[key] = generateLink(i);
      } else if (key.includes('author')) {
        item[key] = generateAuthor(i);
      } else if (key.includes('image')) {
        item[key] = generateImage(i);
      } else if (key.includes('price')) {
        item[key] = generatePrice(i);
      } else {
        item[key] = `Value ${i + 1} for ${key}`;
      }
    });
    
    data.push(item);
  }
  
  return data;
}

/**
 * Get the next run time based on a schedule
 * @param {string} schedule - The schedule (hourly, daily, weekly, monthly)
 * @returns {string} - The next run time
 */
function getNextRunTime(schedule) {
  const now = new Date();
  let nextRun;
  
  switch (schedule) {
    case 'hourly':
      nextRun = new Date(now.getTime() + 60 * 60 * 1000);
      break;
    case 'daily':
      nextRun = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      break;
    case 'weekly':
      nextRun = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      break;
    case 'monthly':
      nextRun = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
      break;
    default:
      nextRun = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Default to daily
  }
  
  return nextRun.toISOString();
}

// Data generation helpers

function generateTitle(index) {
  const titles = [
    'Breaking News: Major Discovery',
    'New Research Reveals Surprising Results',
    'Top 10 Tips for Success',
    'The Ultimate Guide to Data Analysis',
    'How to Improve Your Productivity',
    'Understanding the Latest Trends',
    'Expert Advice on Problem Solving',
    'The Future of Technology',
    'Essential Skills for Modern Professionals',
    'Innovative Approaches to Common Challenges'
  ];
  
  return titles[index % titles.length] + ` #${index + 1}`;
}

function generateDescription(index) {
  const descriptions = [
    'A comprehensive analysis of recent developments in the field.',
    'Experts weigh in on the implications of this groundbreaking discovery.',
    'Learn how to apply these principles to your own work for better results.',
    'This detailed guide covers everything you need to know about the topic.',
    'Practical advice based on years of research and experience.',
    'Discover the latest trends and how they might affect your industry.',
    'A step-by-step approach to solving complex problems efficiently.',
    'Insights into emerging technologies and their potential impact.',
    'Develop these key skills to stay competitive in today\'s market.',
    'Innovative solutions to challenges faced by professionals worldwide.'
  ];
  
  return descriptions[index % descriptions.length];
}

function generateDate(index) {
  const now = new Date();
  const date = new Date(now.getTime() - (index * 24 * 60 * 60 * 1000));
  return date.toISOString().split('T')[0];
}

function generateLink(index) {
  return `https://example.com/article-${index + 1}`;
}

function generateAuthor(index) {
  const authors = [
    'John Smith',
    'Jane Doe',
    'Michael Johnson',
    'Emily Brown',
    'David Wilson',
    'Sarah Miller',
    'Robert Taylor',
    'Jennifer Anderson',
    'William Thomas',
    'Elizabeth Jackson'
  ];
  
  return authors[index % authors.length];
}

function generateImage(index) {
  return `https://example.com/images/article-${index + 1}.jpg`;
}

function generatePrice(index) {
  return (19.99 + (index * 5.99)).toFixed(2);
}

function generateExampleHtml(title) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
      </head>
      <body>
        <header>
          <h1>${title}</h1>
          <nav>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/about">About</a></li>
              <li><a href="/contact">Contact</a></li>
            </ul>
          </nav>
        </header>
        <main>
          <section class="featured">
            <h2>Featured Content</h2>
            <article>
              <h3>Article 1</h3>
              <p>This is the first article.</p>
              <a href="/article/1">Read more</a>
            </article>
            <article>
              <h3>Article 2</h3>
              <p>This is the second article.</p>
              <a href="/article/2">Read more</a>
            </article>
          </section>
        </main>
        <footer>
          <p>&copy; 2024 Example Website</p>
        </footer>
      </body>
    </html>
  `;
}

function generateNewsHtml() {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>News Website</title>
      </head>
      <body>
        <header>
          <h1>Latest News</h1>
        </header>
        <main>
          <div class="news-container">
            <article class="news-item">
              <h2 class="news-title">Breaking News: Major Event</h2>
              <p class="news-date">2024-01-15</p>
              <p class="news-summary">Summary of the major event that just happened.</p>
              <a class="news-link" href="/news/1">Read full story</a>
              <span class="news-author">By John Smith</span>
            </article>
            <article class="news-item">
              <h2 class="news-title">Technology Update: New Innovations</h2>
              <p class="news-date">2024-01-14</p>
              <p class="news-summary">The latest innovations in technology.</p>
              <a class="news-link" href="/news/2">Read full story</a>
              <span class="news-author">By Jane Doe</span>
            </article>
          </div>
        </main>
      </body>
    </html>
  `;
}

function generateBlogHtml() {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Blog Website</title>
      </head>
      <body>
        <header>
          <h1>My Blog</h1>
        </header>
        <main>
          <div class="blog-posts">
            <article class="post">
              <h2 class="post-title">My First Blog Post</h2>
              <div class="post-meta">
                <span class="post-date">January 15, 2024</span>
                <span class="post-author">By Admin</span>
              </div>
              <div class="post-content">
                <p>This is the content of my first blog post.</p>
              </div>
              <a class="post-link" href="/blog/1">Continue reading</a>
            </article>
            <article class="post">
              <h2 class="post-title">My Second Blog Post</h2>
              <div class="post-meta">
                <span class="post-date">January 10, 2024</span>
                <span class="post-author">By Admin</span>
              </div>
              <div class="post-content">
                <p>This is the content of my second blog post.</p>
              </div>
              <a class="post-link" href="/blog/2">Continue reading</a>
            </article>
          </div>
        </main>
      </body>
    </html>
  `;
}

function generateGenericHtml(url) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Website: ${url}</title>
      </head>
      <body>
        <header>
          <h1>Welcome to ${url}</h1>
        </header>
        <main>
          <div class="content">
            <div class="item">
              <h2 class="title">Item 1</h2>
              <p class="description">Description for item 1.</p>
              <span class="price">$19.99</span>
              <a class="link" href="/item/1">View details</a>
            </div>
            <div class="item">
              <h2 class="title">Item 2</h2>
              <p class="description">Description for item 2.</p>
              <span class="price">$29.99</span>
              <a class="link" href="/item/2">View details</a>
            </div>
            <div class="item">
              <h2 class="title">Item 3</h2>
              <p class="description">Description for item 3.</p>
              <span class="price">$39.99</span>
              <a class="link" href="/item/3">View details</a>
            </div>
          </div>
        </main>
      </body>
    </html>
  `;
}

// Export schedule options for UI display
export const SCHEDULE_OPTIONS = [
  { id: 'once', name: 'One-time', description: 'Run the scraper once immediately' },
  { id: 'hourly', name: 'Hourly', description: 'Run the scraper every hour' },
  { id: 'daily', name: 'Daily', description: 'Run the scraper once per day' },
  { id: 'weekly', name: 'Weekly', description: 'Run the scraper once per week' },
  { id: 'monthly', name: 'Monthly', description: 'Run the scraper once per month' }
];

// Export common selector patterns for UI suggestions
export const COMMON_SELECTORS = {
  title: [
    { name: 'Article Title', selector: 'h1, h2.title, .article-title, .post-title' },
    { name: 'Product Name', selector: '.product-name, .product-title, h1.name' },
    { name: 'Heading', selector: 'h1, h2, h3' }
  ],
  content: [
    { name: 'Article Content', selector: '.article-content, .post-content, .content' },
    { name: 'Product Description', selector: '.product-description, .description' },
    { name: 'Paragraph Text', selector: 'p' }
  ],
  price: [
    { name: 'Product Price', selector: '.price, .product-price, span.price' },
    { name: 'Sale Price', selector: '.sale-price, .special-price' }
  ],
  image: [
    { name: 'Main Image', selector: '.main-image, .product-image, img.featured' },
    { name: 'Thumbnail', selector: '.thumbnail, .thumb, img.small' }
  ],
  link: [
    { name: 'Article Link', selector: 'a.read-more, a.article-link' },
    { name: 'Product Link', selector: 'a.product-link, a.view-details' },
    { name: 'Any Link', selector: 'a' }
  ],
  date: [
    { name: 'Publication Date', selector: '.date, .published-date, time' },
    { name: 'Updated Date', selector: '.updated, .modified-date' }
  ],
  author: [
    { name: 'Author Name', selector: '.author, .byline, .writer' }
  ]
};

