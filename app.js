(function () {
  var sampleResume = [
    "Junior data analyst student with internship and project experience.",
    "Built dashboards in Excel and Tableau for a campus organization.",
    "Completed coursework in statistics, SQL, and Python.",
    "Created a capstone project using public transit data to clean datasets, analyze trends, and present recommendations.",
    "Collaborated with a team of 4 students and presented findings to faculty."
  ].join(" ");

  var sampleJob = [
    "Data Analyst Intern",
    "Responsibilities include cleaning data, building dashboards, supporting reporting, and communicating insights to stakeholders.",
    "Required skills include SQL, Excel, Tableau or Power BI, attention to detail, and strong communication.",
    "Experience with Python, data visualization, and cross-functional collaboration is a plus.",
    "Candidates should demonstrate project work, problem solving, and comfort working with large datasets."
  ].join(" ");

  var form = document.getElementById("fitcheck-form");
  var resumeInput = document.getElementById("resumeInput");
  var jobInput = document.getElementById("jobInput");
  var experienceLevel = document.getElementById("experienceLevel");
  var formError = document.getElementById("formError");
  var analyzeButton = document.getElementById("analyzeButton");
  var sampleButton = document.getElementById("sampleButton");

  var emptyState = document.getElementById("emptyState");
  var loadingState = document.getElementById("loadingState");
  var resultsContent = document.getElementById("resultsContent");
  var overallScore = document.getElementById("overallScore");
  var fitBand = document.getElementById("fitBand");
  var scoreSummary = document.getElementById("scoreSummary");
  var breakdownGrid = document.getElementById("breakdownGrid");
  var matchesList = document.getElementById("matchesList");
  var missingList = document.getElementById("missingList");
  var whyList = document.getElementById("whyList");
  var nextStepsList = document.getElementById("nextStepsList");

  function setLoading(isLoading) {
    analyzeButton.disabled = isLoading;
    analyzeButton.textContent = isLoading ? "Analyzing..." : "Analyze Fit";
    loadingState.classList.toggle("hidden", !isLoading);
    if (isLoading) {
      emptyState.classList.add("hidden");
      resultsContent.classList.add("hidden");
    }
  }

  function renderList(target, items) {
    target.innerHTML = "";
    items.forEach(function (item) {
      var li = document.createElement("li");
      li.textContent = item;
      target.appendChild(li);
    });
  }

  function renderBreakdown(items) {
    breakdownGrid.innerHTML = "";
    items.forEach(function (item) {
      var card = document.createElement("article");
      card.className = "breakdown-card";

      var top = document.createElement("div");
      top.className = "breakdown-top";
      top.innerHTML = "<span>" + item.label + "</span><span class=\"breakdown-weight\">" + item.weight + "%</span>";

      var score = document.createElement("p");
      score.className = "breakdown-score";
      score.textContent = item.score + "/100";

      var progress = document.createElement("div");
      progress.className = "progress";

      var bar = document.createElement("span");
      bar.style.width = item.score + "%";
      progress.appendChild(bar);

      var note = document.createElement("p");
      note.className = "breakdown-note";
      note.textContent = item.note;

      card.appendChild(top);
      card.appendChild(score);
      card.appendChild(progress);
      card.appendChild(note);
      breakdownGrid.appendChild(card);
    });
  }

  function renderResults(result) {
    overallScore.textContent = result.overallScore;
    fitBand.textContent = result.fitBand.label;
    fitBand.className = "fit-band " + result.fitBand.tone;
    scoreSummary.textContent = result.summary;

    renderBreakdown(result.breakdown);
    renderList(matchesList, result.matches);
    renderList(missingList, result.missing);
    renderList(whyList, result.whyItMatters);
    renderList(nextStepsList, result.nextSteps);

    loadingState.classList.add("hidden");
    emptyState.classList.add("hidden");
    resultsContent.classList.remove("hidden");
  }

  sampleButton.addEventListener("click", function () {
    resumeInput.value = sampleResume;
    jobInput.value = sampleJob;
    experienceLevel.value = "some experience";
    formError.textContent = "";
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    formError.textContent = "";

    var resumeText = resumeInput.value.trim();
    var jobText = jobInput.value.trim();

    if (!resumeText || !jobText) {
      formError.textContent = "Please add both your background and the job description before analyzing fit.";
      emptyState.classList.remove("hidden");
      loadingState.classList.add("hidden");
      resultsContent.classList.add("hidden");
      return;
    }

    setLoading(true);

    window.setTimeout(function () {
      try {
        var result = window.FitCheckScoring.analyzeFit({
          resumeText: resumeText,
          jobText: jobText,
          experienceLevel: experienceLevel.value
        });
        renderResults(result);
      } catch (error) {
        loadingState.classList.add("hidden");
        emptyState.classList.remove("hidden");
        resultsContent.classList.add("hidden");
        formError.textContent = "Something went wrong while analyzing the fit. Please try again with a shorter paste.";
      } finally {
        setLoading(false);
      }
    }, 450);
  });
})();
