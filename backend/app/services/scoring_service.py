import structlog

logger = structlog.get_logger()

WEIGHT_INCOME = 0.35
WEIGHT_CREDIT = 0.30
WEIGHT_EMPLOYMENT = 0.20
WEIGHT_RENTAL_HISTORY = 0.15


def score_income_to_rent(annual_income: float | None, monthly_rent: float | None) -> float:
    if not annual_income or not monthly_rent or monthly_rent <= 0:
        return 0.0
    ratio = annual_income / (monthly_rent * 12)
    if ratio >= 3.0:
        return 100.0
    if ratio < 2.0:
        return 0.0
    return (ratio - 2.0) / (3.0 - 2.0) * 100.0


def score_credit(credit_score: int | None) -> float:
    if credit_score is None:
        return 0.0
    if credit_score >= 750:
        return 100.0
    if credit_score >= 650:
        return 70.0
    if credit_score >= 600:
        return 40.0
    return 0.0


def score_employment(employment_status: str | None) -> float:
    status_scores: dict[str, float] = {
        "EMPLOYED": 100.0,
        "SELF_EMPLOYED": 80.0,
        "STUDENT": 50.0,
        "OTHER": 30.0,
    }
    return status_scores.get(employment_status or "OTHER", 30.0)


def score_rental_history(has_evictions: bool) -> tuple[float, bool]:
    if has_evictions:
        return 0.0, True
    return 100.0, False


def compute_qualification_score(
    annual_income: float | None,
    monthly_rent: float | None,
    credit_score: int | None,
    employment_status: str | None,
    has_evictions: bool,
) -> tuple[int, dict[str, float], bool]:
    income_score = score_income_to_rent(annual_income, monthly_rent)
    credit = score_credit(credit_score)
    employment = score_employment(employment_status)
    rental, hard_fail = score_rental_history(has_evictions)

    if hard_fail:
        factors = {
            "income_to_rent": round(income_score, 1),
            "credit_score": round(credit, 1),
            "employment": round(employment, 1),
            "rental_history": 0.0,
        }
        logger.info(
            "qualification_score_computed",
            score=0,
            hard_fail=True,
            factors=factors,
        )
        return 0, factors, True

    weighted = (
        income_score * WEIGHT_INCOME
        + credit * WEIGHT_CREDIT
        + employment * WEIGHT_EMPLOYMENT
        + rental * WEIGHT_RENTAL_HISTORY
    )
    final_score = round(weighted)

    factors = {
        "income_to_rent": round(income_score, 1),
        "credit_score": round(credit, 1),
        "employment": round(employment, 1),
        "rental_history": round(rental, 1),
    }

    logger.info(
        "qualification_score_computed",
        score=final_score,
        hard_fail=False,
        factors=factors,
    )
    return final_score, factors, False
