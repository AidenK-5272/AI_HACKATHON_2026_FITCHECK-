(function () {
  var STOP_WORDS = new Set([
    "a", "about", "above", "across", "after", "again", "against", "all", "also", "am", "an",
    "and", "any", "are", "as", "at", "be", "because", "been", "before", "being", "below", "between",
    "both", "but", "by", "can", "could", "day", "did", "do", "does", "each", "for", "from", "further",
    "had", "has", "have", "having", "he", "her", "here", "hers", "him", "his", "how", "i", "if",
    "in", "into", "is", "it", "its", "itself", "just", "me", "more", "most", "my", "no", "not",
    "now", "of", "on", "once", "only", "or", "other", "our", "out", "over", "own", "same", "she",
    "should", "so", "some", "such", "than", "that", "the", "their", "them", "then", "there", "these",
    "they", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "we",
    "were", "what", "when", "where", "which", "while", "who", "why", "will", "with", "you", "your"
  ]);

  var TERM_LIBRARY = [
    "excel", "sql", "python", "java", "javascript", "typescript", "react", "node", "power bi", "tableau",
    "salesforce", "figma", "adobe", "illustrator", "photoshop", "canva", "jira", "confluence", "aws", "azure",
    "gcp", "git", "github", "docker", "kubernetes", "linux", "r", "matlab", "c++", "c#", "html", "css",
    "api", "rest", "graphql", "firebase", "postgresql", "mysql", "mongodb", "machine learning", "data analysis",
    "data visualization", "project management", "agile", "scrum", "user research", "wireframing", "product design",
    "seo", "content strategy", "social media", "copywriting", "email marketing", "financial modeling", "accounting",
    "customer service", "crm", "debugging", "testing", "automation", "presentation", "communication", "leadership",
    "collaboration", "stakeholder management", "problem solving", "research", "statistics", "etl", "data cleaning"
  ];

  var EXPERIENCE_LEVEL_MULTIPLIERS = {
    "beginner": 0.82,
    "some experience": 0.92,
    "intermediate": 1,
    "advanced": 1.06
  };

  var EXPERIENCE_SIGNALS = [
    "intern", "internship", "project", "projects", "coursework", "capstone", "research", "built", "designed",
    "developed", "launched", "managed", "analyzed", "led", "created", "implemented", "optimized", "improved",
    "collaborated", "volunteer", "freelance", "club", "team"
  ];

  function tokenize(text) {
    return (text || "")
      .toLowerCase()
      .replace(/[^a-z0-9+#./\s-]/g, " ")
      .split(/\s+/)
      .filter(Boolean);
  }

  function unique(array) {
    return Array.from(new Set(array));
  }

  function toTitle(term) {
    return term.replace(/\b\w/g, function (letter) {
      return letter.toUpperCase();
    });
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function getKnownTerms(text) {
    var lower = (text || "").toLowerCase();
    return TERM_LIBRARY.filter(function (term) {
      return lower.indexOf(term) !== -1;
    });
  }

  function getTopKeywords(text, limit) {
    var counts = {};
    tokenize(text).forEach(function (token) {
      if (token.length < 4 || STOP_WORDS.has(token) || /\d/.test(token)) {
        return;
      }
      counts[token] = (counts[token] || 0) + 1;
    });

    return Object.keys(counts)
      .sort(function (a, b) {
        if (counts[b] !== counts[a]) {
          return counts[b] - counts[a];
        }
        return a.localeCompare(b);
      })
      .slice(0, limit);
  }

  function getExperienceYearsEstimate(text) {
    var lower = (text || "").toLowerCase();
    var match = lower.match(/(\d+)\+?\s*(?:years|yrs)/);
    if (match) {
      return clamp(parseInt(match[1], 10), 0, 12);
    }

    var signals = tokenize(lower).filter(function (token) {
      return token === "internship" || token === "intern" || token === "project" || token === "projects";
    }).length;

    return clamp(Math.round(signals / 2), 0, 4);
  }

  function classifyFitBand(score) {
    if (score >= 80) {
      return {
        label: "Strong fit. Apply confidently.",
        tone: "strong"
      };
    }

    if (score >= 60) {
      return {
        label: "Moderate fit. Apply with targeted improvements.",
        tone: "moderate"
      };
    }

    return {
      label: "Stretch. Revise first or apply strategically.",
      tone: "stretch"
    };
  }

  function formatList(items, emptyFallback) {
    return items.length ? items : [emptyFallback];
  }

  function buildRecommendations(context) {
    var recommendations = [];
    var missingSkills = context.missingSkills.slice(0, 3);
    var missingKeywords = context.missingKeywords.slice(0, 3);

    missingSkills.forEach(function (skill) {
      recommendations.push(
        "This job emphasizes " + toTitle(skill) + ". Add one concrete proof point, such as a class project, club deliverable, internship task, or portfolio example that uses it."
      );
    });

    if (context.experienceGap > 0) {
      recommendations.push(
        "Your current experience level reads lighter than the role asks for. Bridge that gap with one targeted example showing ownership, outcomes, and the tools you used."
      );
    }

    if (missingKeywords.length) {
      recommendations.push(
        "Several repeated job keywords are missing from your background: " + missingKeywords.map(toTitle).join(", ") + ". Mirror the job language where it is truthful so recruiters can connect your experience faster."
      );
    }

    if (!context.resumeHasProjects) {
      recommendations.push(
        "Your background does not clearly mention projects. Add a short project section with tools, scope, and results so employers can see role-specific evidence."
      );
    }

    if (!context.resumeHasMetrics) {
      recommendations.push(
        "Add outcome language where possible, such as percentages, counts, timelines, or deliverables. Numbers make your experience easier to trust and compare."
      );
    }

    if (!recommendations.length) {
      recommendations.push(
        "Your alignment is already solid. Focus on tightening the strongest evidence for the top job requirements and keep the wording close to the posting."
      );
    }

    return unique(recommendations).slice(0, 5);
  }

  function analyzeFit(inputs) {
    var resumeText = inputs.resumeText || "";
    var jobText = inputs.jobText || "";
    var experienceLevel = inputs.experienceLevel || "intermediate";

    var resumeTerms = getKnownTerms(resumeText);
    var jobTerms = getKnownTerms(jobText);
    var matchedSkills = jobTerms.filter(function (term) {
      return resumeTerms.indexOf(term) !== -1;
    });
    var missingSkills = jobTerms.filter(function (term) {
      return resumeTerms.indexOf(term) === -1;
    });

    var topJobKeywords = getTopKeywords(jobText, 16);
    var resumeTokens = new Set(tokenize(resumeText));
    var keywordMatches = topJobKeywords.filter(function (keyword) {
      return resumeTokens.has(keyword);
    });
    var missingKeywords = topJobKeywords.filter(function (keyword) {
      return !resumeTokens.has(keyword);
    });

    var experienceRequiredYears = getExperienceYearsEstimate(jobText);
    var resumeYearsEstimate = getExperienceYearsEstimate(resumeText);
    var experienceMultiplier = EXPERIENCE_LEVEL_MULTIPLIERS[experienceLevel] || 1;
    var adjustedResumeYears = resumeYearsEstimate * experienceMultiplier;
    var experienceGap = clamp(experienceRequiredYears - adjustedResumeYears, 0, 6);

    var resumeSignalCount = EXPERIENCE_SIGNALS.filter(function (signal) {
      return resumeText.toLowerCase().indexOf(signal) !== -1;
    }).length;
    var jobSignalCount = EXPERIENCE_SIGNALS.filter(function (signal) {
      return jobText.toLowerCase().indexOf(signal) !== -1;
    }).length;

    var resumeHasProjects = /project|portfolio|capstone|case study/i.test(resumeText);
    var resumeHasMetrics = /\b\d+%|\b\d+\s*(users|customers|clients|projects|weeks|months|days|hours|reports|campaigns|datasets)\b/i.test(resumeText);
    var resumeHasSections = /experience|education|skills|projects|summary/i.test(resumeText);

    var skillsScore = Math.round(
      clamp(
        (matchedSkills.length / Math.max(jobTerms.length, 1)) * 100 +
        (keywordMatches.length / Math.max(topJobKeywords.length, 1)) * 20,
        0,
        100
      )
    );

    var experienceScore = Math.round(
      clamp(
        70 - (experienceGap * 14) + (resumeSignalCount * 4) + Math.min(jobSignalCount, 5) * 2,
        0,
        100
      )
    );

    var atsScore = Math.round(
      clamp(
        (keywordMatches.length / Math.max(topJobKeywords.length, 1)) * 75 +
        (resumeHasSections ? 15 : 0) +
        (resumeHasMetrics ? 10 : 0),
        0,
        100
      )
    );

    var roleSignalsScore = Math.round(
      clamp(
        (matchedSkills.length * 10) +
        (resumeHasProjects ? 20 : 0) +
        (resumeHasMetrics ? 15 : 0) +
        (resumeSignalCount * 4),
        0,
        100
      )
    );

    var weightedScore = Math.round(
      (skillsScore * 0.4) +
      (experienceScore * 0.3) +
      (atsScore * 0.15) +
      (roleSignalsScore * 0.15)
    );

    var fitBand = classifyFitBand(weightedScore);
    var matches = formatList([
      matchedSkills.length ? "Matched tools and skills: " + matchedSkills.slice(0, 6).map(toTitle).join(", ") + "." : "",
      keywordMatches.length ? "Your background overlaps with repeated job language such as " + keywordMatches.slice(0, 5).map(toTitle).join(", ") + "." : "",
      resumeHasProjects ? "You already mention project-style evidence, which helps prove role readiness beyond coursework alone." : "",
      resumeHasMetrics ? "You include at least some measurable outcomes, which makes your experience more credible in screening." : ""
    ].filter(Boolean), "The current match is limited, which means the role likely needs clearer proof points before you apply.");

    var missing = formatList([
      missingSkills.length ? "Missing or weak skill coverage: " + missingSkills.slice(0, 6).map(toTitle).join(", ") + "." : "",
      experienceGap > 0 ? "The job description suggests more experience depth than your current profile communicates." : "",
      missingKeywords.length ? "Important repeated job terms are not showing up clearly enough in your background." : "",
      !resumeHasProjects ? "There is little visible project evidence tied to the role." : ""
    ].filter(Boolean), "No major gaps stood out in the quick scan.");

    var whyItMatters = formatList([
      missingSkills.length ? "Employers often screen for the specific tools named in the posting, so missing terms can reduce interview chances even when you are capable of learning quickly." : "",
      experienceGap > 0 ? "Experience relevance matters because hiring teams use it to judge how much ramp-up the role may require." : "",
      missingKeywords.length ? "Keyword alignment matters for early review because recruiters and ATS-style screeners rely on recognizable language from the posting." : "",
      !resumeHasProjects ? "Projects matter for students because they substitute for years of formal work and show applied ability." : ""
    ].filter(Boolean), "Your current materials already line up reasonably well with the role's main signals.");

    var nextSteps = buildRecommendations({
      missingSkills: missingSkills,
      missingKeywords: missingKeywords,
      experienceGap: experienceGap,
      resumeHasProjects: resumeHasProjects,
      resumeHasMetrics: resumeHasMetrics
    });

    return {
      overallScore: weightedScore,
      fitBand: fitBand,
      summary: "This score blends skills match (40%), experience relevance (30%), ATS-inspired keyword and formatting alignment (15%), and role-specific signals like projects and tools (15%).",
      breakdown: [
        {
          label: "Skills Match",
          weight: 40,
          score: skillsScore,
          note: matchedSkills.length
            ? "Found " + matchedSkills.length + " direct skill/tool matches against the job description."
            : "The job lists skills that are not yet clearly reflected in your background."
        },
        {
          label: "Experience Relevance",
          weight: 30,
          score: experienceScore,
          note: experienceGap > 0
            ? "Your profile signals less direct depth than the role appears to request."
            : "Your current experience level and examples look reasonably aligned for the role."
        },
        {
          label: "ATS Alignment",
          weight: 15,
          score: atsScore,
          note: keywordMatches.length
            ? "Repeated job keywords appear in your background, which should improve early screening clarity."
            : "The wording in your background does not yet mirror the job posting closely enough."
        },
        {
          label: "Role-Specific Signals",
          weight: 15,
          score: roleSignalsScore,
          note: resumeHasProjects
            ? "Projects and applied examples strengthen the role-readiness signal."
            : "The profile needs more concrete project or tool evidence tied to the target role."
        }
      ],
      matches: matches,
      missing: missing,
      whyItMatters: whyItMatters,
      nextSteps: nextSteps
    };
  }

  window.FitCheckScoring = {
    analyzeFit: analyzeFit,
    classifyFitBand: classifyFitBand
  };
})();
