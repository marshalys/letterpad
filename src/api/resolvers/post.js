import {
  addConditionsPlaceholder,
  executePostCollectionQuery,
  resolveAuthor,
  resolveMenuFilter,
  resolveOrderAndSort,
  resolvePagination,
  resolveSearchTerm,
  resolveStatusAndTypeAndFeatured,
  resolveTagFilter,
} from "./post/fieldResolver";
import {
  addUpdateDataPlaceholder,
  executeUpdatePost,
  updateContent,
  updateCoverImage,
  updateDatesAndStatus,
  updateMenuOnTitleChange,
  updateReadingTime,
  updateTaxonomies,
  updateTitleAndSlugAndFeatured,
} from "./post/updatePostResolver";
import {
  checkDisplayAccess,
  createPostsPerm,
  editPostPerm,
} from "../utils/permissions";

import Fuse from "fuse.js";
import Sequelize from "sequelize";
import { _createPost } from "../models/post";
import config from "../../config";
import crypto from "crypto";
import { decrypt } from "../utils/crypto";
import { deletePostResolver } from "./post/deletePostResolver";
import { getReadableDate } from "../../shared/date";
import { innertext } from "../utils/common";
import logger from "../../shared/logger";
import { mdToHtml } from "letterpad-editor";
import { statsResolver } from "./post/statsResolver";

const host = config.ROOT_URL + config.BASE_NAME;

const noResult = {
  count: 0,
  rows: [],
};

const postresolver = {
  Query: {
    /**
     * Query to take care of multiple post in one page.
     * Used for Search and Admin posts and pages list.
     */
    posts: checkDisplayAccess
      .createResolver(addConditionsPlaceholder)
      .createResolver(resolveMenuFilter)
      .createResolver(resolveTagFilter)
      .createResolver(resolveAuthor)
      .createResolver(resolvePagination)
      .createResolver(resolveStatusAndTypeAndFeatured)
      .createResolver(resolveOrderAndSort)
      .createResolver(resolveSearchTerm)
      .createResolver(executePostCollectionQuery)
      .createResolver(async (root, args) => {
        if (!args) return noResult;
        args.rows = args.rows.map(item => {
          item.dataValues = normalizePost(item.dataValues);
          item.dataValues.md = "...[truncated]";
          item.dataValues.html = "...[truncated]";
          return item;
        });
        return args;
      }),

    /**
     * Query to handle a single post/page.
     */
    post: checkDisplayAccess.createResolver(async (root, args, { models }) => {
      logger.debug("Reached resolver: post");
      const { previewHash, ...filters } = args.filters;
      const conditions = { where: { ...filters } };
      if (args.filters.id) {
        conditions.where.id = args.filters.id;
      }
      if (args.filters.slug) {
        conditions.where.slug = args.filters.slug;
      }
      if (previewHash) {
        console.log("decrypt(previewHash) :>> ", decrypt(previewHash));
        conditions.where.id = decrypt(previewHash);
      }
      let post = await models.Post.findOne(conditions);
      if (post) {
        post.dataValues = normalizePost(post.dataValues);
        if (previewHash && post.dataValues.md_draft) {
          // if the post is published and this is preview for republish,
          // then the html content will comee from md_draft
          post.dataValues.html = mdToHtml(post.dataValues.md_draft);
        }
      }
      return post;
    }),

    search: async (root, args, { models, user }) => {
      logger.debug("Reached resolver: search");

      const data = await models.Post.findAll({
        attributes: ["id", "title", "html", "excerpt", "publishedAt", "slug"],
        where: { status: "publish" },
      });

      const cleanedData = data.map(item => {
        let cleanItem = item.toJSON();
        cleanItem.html = innertext(cleanItem.html);
        return cleanItem;
      });

      const options = {
        keys: [
          {
            name: "title",
            weight: 1,
          },
          {
            name: "excerpt",
            weight: 0.9,
          },
          {
            name: "html",
            weight: 0.8,
          },
        ],
        includeMatches: true,
      };

      const fuse = new Fuse(cleanedData, options);
      const searchResult = fuse.search(args.query).map(data => {
        delete data.item.html;
        return data.item;
      });
      return {
        ok: true,
        rows: searchResult.slice(0, 6),
        count: 6,
      };
    },

    /**
     * Query to take care of adjacent posts.
     */
    adjacentPosts: async (root, args, { models }) => {
      let result = {};
      args.status = "publish";
      args.type = "post";
      // get the current post
      const currentPost = await models.Post.findOne({ where: args });
      if (currentPost === null) {
        throw new Error("Invalid query");
      }

      // we dont need the slug anymore. Clone and remove it.
      const { slug, ...newArgs } = args;

      // get the preview item
      result.previous = await models.Post.findOne({
        where: {
          ...newArgs,
          id: { [Sequelize.Op.lt]: currentPost.id },
        },
        order: [["id", "DESC"]],
      });

      result.previous = normalizePost(result.previous);

      // get the next item
      result.next = await models.Post.findOne({
        where: {
          ...newArgs,
          id: {
            [Sequelize.Op.gt]: currentPost.dataValues.id,
          },
        },
        order: [["id", "ASC"]],
      });
      result.next = normalizePost(result.next);
      return result;
    },
    /**
     * Query to get some stats for the admin dashboard
     * TODO: Make one query to process all the data
     */
    stats: statsResolver,
  },
  Mutation: {
    createPost: createPostsPerm.createResolver(
      async (root, args, { models, user }) => {
        args.data.authorId = user.id;
        const result = await _createPost(args.data, models);
        result.post.dataValues = normalizePost(result.post.dataValues);
        return result;
      },
    ),
    updatePost: editPostPerm
      .createResolver(addUpdateDataPlaceholder)
      .createResolver(updateTitleAndSlugAndFeatured)
      .createResolver(updateDatesAndStatus)
      .createResolver(updateCoverImage)
      .createResolver(updateReadingTime)
      .createResolver(updateContent)
      .createResolver(updateTaxonomies)
      .createResolver(updateMenuOnTitleChange)
      .createResolver(executeUpdatePost)
      .createResolver(async (root, result) => {
        result.post.dataValues = normalizePost(result.post.dataValues);
        return result;
      }),

    deletePosts: editPostPerm.createResolver(deletePostResolver),
  },
  Post: {
    author: async post => {
      const author = await post.getAuthor();
      if (author.avatar.startsWith("/")) {
        author.avatar = host + author.avatar;
      }
      return author;
    },
    tags: async post => {
      const taxonomies = await post.getTaxonomies();
      return taxonomies
        .filter(item => item.type === "post_tag")
        .map(item => {
          item.slug = "/tag/" + item.slug;
          return item;
        });
    },
  },
};

export default postresolver;

export function normalizePost(post) {
  let {
    cover_image_width,
    cover_image_height,
    cover_image,
    slug,
    ...rest
  } = post;
  if (cover_image && cover_image.startsWith("/")) {
    cover_image = host + "/" + cover_image;
  }

  // normalize cover image
  post = {
    ...rest,
    cover_image: {
      src: cover_image || "",
      width: cover_image_width || 0,
      height: cover_image_height || 0,
    },
    slug: "/" + rest.type + "/" + slug,
    publishedAt: getReadableDate(rest.publishedAt),
    updatedAt: getReadableDate(rest.updatedAt),
    createdAt: getReadableDate(rest.createdAt),
  };

  return post;
}
