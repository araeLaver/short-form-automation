import axios from 'axios';
import cheerio from 'cheerio';
import OpenAI from 'openai';
import { logger } from '../utils/logger.js';

export class KoreaNewsCollector {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.newsAPIs = {
      naver: {
        url: 'https://openapi.naver.com/v1/search/news.json',
        headers: {
          'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID,
          'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET
        }
      }
    };
  }

  async collectTrendingNews() {
    try {
      const trendingKeywords = await this.getTrendingKeywords();
      const newsArticles = [];

      for (const keyword of trendingKeywords.slice(0, 5)) {
        const articles = await this.searchNews(keyword);
        newsArticles.push(...articles);
      }

      return this.filterAndRankArticles(newsArticles);
    } catch (error) {
      logger.error('Failed to collect trending news:', error);
      throw error;
    }
  }

  async getTrendingKeywords() {
    try {
      const response = await axios.get('https://trends.google.com/trends/trendingsearches/daily/rss?geo=KR');
      const $ = cheerio.load(response.data, { xmlMode: true });
      const keywords = [];
      
      $('item title').each((i, elem) => {
        if (i < 10) {
          keywords.push($(elem).text());
        }
      });

      return keywords;
    } catch (error) {
      logger.error('Failed to get trending keywords:', error);
      return ['대한민국', '서울', '경제', '정치', '연예'];
    }
  }

  async searchNews(keyword) {
    try {
      const response = await axios.get(this.newsAPIs.naver.url, {
        headers: this.newsAPIs.naver.headers,
        params: {
          query: keyword,
          display: 10,
          sort: 'date'
        }
      });

      return response.data.items.map(item => ({
        title: item.title.replace(/<[^>]*>/g, ''),
        description: item.description.replace(/<[^>]*>/g, ''),
        link: item.link,
        pubDate: item.pubDate,
        keyword: keyword
      }));
    } catch (error) {
      logger.error(`Failed to search news for keyword ${keyword}:`, error);
      return [];
    }
  }

  filterAndRankArticles(articles) {
    const uniqueArticles = Array.from(
      new Map(articles.map(article => [article.title, article])).values()
    );

    return uniqueArticles
      .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
      .slice(0, 3);
  }

  async generateScript(newsData) {
    try {
      const prompt = `
        다음 뉴스를 바탕으로 60초 이내의 숏폼 비디오 스크립트를 작성해주세요:
        ${JSON.stringify(newsData, null, 2)}
        
        형식:
        1. 후킹 인트로 (5초)
        2. 핵심 내용 전달 (45초)
        3. 마무리 및 CTA (10초)
        
        톤: 젊고 활기찬, 정보전달 중심
        JSON 형식으로 반환: {title, hook, mainContent, closing, description, tags[]}
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      logger.error('Failed to generate script:', error);
      throw error;
    }
  }
}