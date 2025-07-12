import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  author?: string;
  url?: string;
  image?: string;
  type?: 'website' | 'article' | 'profile';
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
  structuredData?: any;
}

const DEFAULT_SEO = {
  title: 'StackIt - Q&A Platform',
  description: 'StackIt is a modern question-and-answer platform for developers and tech enthusiasts. Ask questions, share knowledge, and learn together.',
  keywords: ['programming', 'q&a', 'questions', 'answers', 'coding', 'development', 'technology', 'community'],
  author: 'StackIt Team',
  url: 'https://stackit.example.com',
  image: '/og-image.jpg',
  type: 'website' as const
};

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords = [],
  author,
  url,
  image,
  type = 'website',
  publishedTime,
  modifiedTime,
  tags = [],
  canonical,
  noindex = false,
  nofollow = false,
  structuredData
}) => {
  const seo = {
    title: title ? `${title} | StackIt` : DEFAULT_SEO.title,
    description: description || DEFAULT_SEO.description,
    keywords: [...DEFAULT_SEO.keywords, ...keywords],
    author: author || DEFAULT_SEO.author,
    url: url || DEFAULT_SEO.url,
    image: image || DEFAULT_SEO.image,
    type
  };

  const robotsContent = [
    noindex ? 'noindex' : 'index',
    nofollow ? 'nofollow' : 'follow'
  ].join(', ');

  useEffect(() => {
    // Set document title
    document.title = seo.title;

    // Create or update meta tags
    const updateMeta = (name: string, content: string, property?: boolean) => {
      const attribute = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    // Basic meta tags
    updateMeta('description', seo.description);
    updateMeta('keywords', seo.keywords.join(', '));
    updateMeta('author', seo.author);
    updateMeta('robots', robotsContent);

    // Open Graph tags
    updateMeta('og:title', seo.title, true);
    updateMeta('og:description', seo.description, true);
    updateMeta('og:type', seo.type, true);
    updateMeta('og:url', seo.url, true);
    updateMeta('og:image', seo.image, true);
    updateMeta('og:image:alt', seo.title, true);
    updateMeta('og:site_name', 'StackIt', true);
    updateMeta('og:locale', 'en_US', true);

    // Twitter Card tags
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', seo.title);
    updateMeta('twitter:description', seo.description);
    updateMeta('twitter:image', seo.image);
    updateMeta('twitter:image:alt', seo.title);
    updateMeta('twitter:creator', '@stackit');
    updateMeta('twitter:site', '@stackit');

    // Article specific tags
    if (type === 'article') {
      if (publishedTime) {
        updateMeta('article:published_time', publishedTime, true);
      }
      if (modifiedTime) {
        updateMeta('article:modified_time', modifiedTime, true);
      }
      tags.forEach((tag, index) => {
        updateMeta(`article:tag${index}`, tag, true);
      });
    }

    // Canonical URL
    if (canonical) {
      let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.rel = 'canonical';
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.href = canonical;
    }

    // Structured Data
    if (structuredData) {
      let structuredDataScript = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
      if (!structuredDataScript) {
        structuredDataScript = document.createElement('script');
        structuredDataScript.type = 'application/ld+json';
        document.head.appendChild(structuredDataScript);
      }
      structuredDataScript.textContent = JSON.stringify(structuredData);
    }

    // Cleanup function to remove meta tags when component unmounts
    return () => {
      // Don't remove meta tags on unmount as they should persist
      // Only remove if we need to clean up specific tags
    };
  }, [seo, robotsContent, type, publishedTime, modifiedTime, tags, canonical, structuredData]);

  return null; // This component doesn't render anything visible
};

// Predefined SEO configurations for different pages
export const HomeSEO: React.FC = () => (
  <SEO
    title="Home"
    description="Discover the latest programming questions and answers on StackIt. Join our community of developers and tech enthusiasts."
    keywords={['programming questions', 'coding help', 'developer community', 'tech q&a']}
    structuredData={{
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'StackIt',
      description: 'Q&A Platform for Developers',
      url: 'https://stackit.example.com',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://stackit.example.com/search?q={search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    }}
  />
);

export const QuestionSEO: React.FC<{
  question: {
    title: string;
    content: string;
    author: { username: string };
    tags: { name: string }[];
    createdAt: string;
    updatedAt: string;
    votes: number;
    views: number;
    answers?: any[];
    acceptedAnswerId?: string;
  };
  questionId: string;
}> = ({ question, questionId }) => (
  <SEO
    title={question.title}
    description={question.content.replace(/<[^>]*>/g, '').substring(0, 160)}
    keywords={question.tags.map(tag => tag.name)}
    type="article"
    publishedTime={question.createdAt}
    modifiedTime={question.updatedAt}
    tags={question.tags.map(tag => tag.name)}
    url={`https://stackit.example.com/questions/${questionId}`}
    canonical={`https://stackit.example.com/questions/${questionId}`}
    structuredData={{
      '@context': 'https://schema.org',
      '@type': 'QAPage',
      mainEntity: {
        '@type': 'Question',
        name: question.title,
        text: question.content,
        answerCount: question.answers?.length || 0,
        upvoteCount: question.votes,
        dateCreated: question.createdAt,
        author: {
          '@type': 'Person',
          name: question.author.username
        },
        acceptedAnswer: question.acceptedAnswerId ? {
          '@type': 'Answer',
          text: 'Accepted answer content would be here',
          author: {
            '@type': 'Person',
            name: 'Answer author'
          }
        } : undefined
      }
    }}
  />
);

export const UserSEO: React.FC<{
  user: {
    username: string;
    bio?: string;
    reputation: number;
    createdAt: string;
  };
  userId: string;
}> = ({ user, userId }) => (
  <SEO
    title={`${user.username}'s Profile`}
    description={user.bio || `View ${user.username}'s profile on StackIt. Reputation: ${user.reputation}`}
    type="profile"
    url={`https://stackit.example.com/users/${userId}`}
    canonical={`https://stackit.example.com/users/${userId}`}
    structuredData={{
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: user.username,
      description: user.bio,
      url: `https://stackit.example.com/users/${userId}`,
      knowsAbout: 'Programming and Technology'
    }}
  />
);

export const TagSEO: React.FC<{
  tag: {
    name: string;
    description?: string;
    questionCount: number;
  };
}> = ({ tag }) => (
  <SEO
    title={`Questions tagged [${tag.name}]`}
    description={tag.description || `Browse ${tag.questionCount} questions tagged with ${tag.name} on StackIt.`}
    keywords={[tag.name, `${tag.name} questions`, `${tag.name} programming`]}
    url={`https://stackit.example.com/tags/${tag.name}`}
    canonical={`https://stackit.example.com/tags/${tag.name}`}
    structuredData={{
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${tag.name} Questions`,
      description: tag.description,
      url: `https://stackit.example.com/tags/${tag.name}`,
      numberOfItems: tag.questionCount
    }}
  />
);

export const SearchSEO: React.FC<{ query: string; resultCount: number }> = ({ query, resultCount }) => (
  <SEO
    title={`Search results for "${query}"`}
    description={`Found ${resultCount} results for "${query}" on StackIt. Browse questions and answers from our developer community.`}
    keywords={[query, 'search', 'programming questions']}
    url={`https://stackit.example.com/search?q=${encodeURIComponent(query)}`}
    noindex={true} // Don't index search result pages
    structuredData={{
      '@context': 'https://schema.org',
      '@type': 'SearchResultsPage',
      query: query,
      numberOfItems: resultCount
    }}
  />
);

export default SEO; 