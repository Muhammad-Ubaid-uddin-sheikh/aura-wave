import { defineType } from "sanity";

export default defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    // ✅ Policies
    {
      name: "policies",
      title: "Policies",
      type: "object",
      fields: [
        {
          name: "privacy",
          title: "Privacy Policy",
          type: "array",
          of: [{ type: "block" }],
        },
        {
          name: "shipping",
          title: "Shpping Policy",
          type: "array",
          of: [{ type: "block" }],
        },
        {
          name: "terms",
          title: "Terms & Conditions",
          type: "array",
          of: [{ type: "block" }],
        },
        {
          name: "complaints",
          title: "Complaints & Feedback",
          type: "array",
          of: [{ type: "block" }],
        },
      ],
    },
  ],
});