from typing import Optional

from constants.languages import languages
from extensions.ext_database import db
from models.model import App, RecommendedApp
from services.app_dsl_service import AppDslService
from services.recommend_app.recommend_app_base import RecommendAppRetrievalBase
from services.recommend_app.recommend_app_type import RecommendAppType


class DatabaseRecommendAppRetrieval(RecommendAppRetrievalBase):
    """
    Retrieval recommended app from database
    """

    def get_recommended_apps_and_categories(self, language: str) -> dict:
        result = self.fetch_recommended_apps_from_db(language)
        return result

    def get_recommend_app_detail(self, app_id: str):
        result = self.fetch_recommended_app_detail_from_db(app_id)
        return result

    def get_type(self) -> str:
        return RecommendAppType.DATABASE

    @classmethod
    def fetch_recommended_apps_from_db(cls, language: str) -> dict:
        """
        Fetch recommended apps from db.
        :param language: language
        :return:
        """
        recommended_apps = (
            db.session.query(RecommendedApp)
            .filter(RecommendedApp.is_listed == True, RecommendedApp.language == language)
            .all()
        )

        if len(recommended_apps) == 0:
            recommended_apps = (
                db.session.query(RecommendedApp)
                .filter(RecommendedApp.is_listed == True, RecommendedApp.language == languages[0])
                .all()
            )

        categories = set()
        recommended_apps_result = []
        for recommended_app in recommended_apps:
            app = recommended_app.app
            if not app or not app.is_public:
                continue
            
            # Takin command:此处暂时隐藏
            # site = app.site
            # if not site:
            #     continue

            user = db.session.query(Account).filter(Account.id == app.user_id).first()
            doc = collection.find_one({"email": user.email})
            app_result = {
                "id": recommended_app.id,
                "app": {
                    "id": app.id,
                    "name": app.name,
                    "mode": app.mode,
                    "icon": app.icon,
                    "icon_background": app.icon_background,
                    "username": doc.get("name") or user.name,
                },
                "app_id": recommended_app.app_id,
                "description": app.description,
                "copyright": "",
                "privacy_policy": "",
                "custom_disclaimer": "",
                "category": recommended_app.category,
                "position": recommended_app.position,
                "is_listed": recommended_app.is_listed,
            }
            # Takin.AI command 修改推荐的app TODO: 根据用户角色区分 -[mongo role = 50] admin的role才能推送到recommended_apps_result
            if user.email == "curator@takin.ai":
                recommended_apps_result.append(app_result)
            else:
                community_apps_result.append(app_result)

            categories.add(recommended_app.category)  # add category to categories

        return {
            "recommended_apps": recommended_apps_result,
            "community": community_apps_result,
            "categories": sorted(categories),
        }

    @classmethod
    def fetch_recommended_app_detail_from_db(cls, app_id: str) -> Optional[dict]:
        """
        Fetch recommended app detail from db.
        :param app_id: App ID
        :return:
        """
        # is in public recommended list
        recommended_app = (
            db.session.query(RecommendedApp)
            .filter(RecommendedApp.is_listed == True, RecommendedApp.app_id == app_id)
            .first()
        )

        if not recommended_app:
            return None

        # get app detail
        app_model = db.session.query(App).filter(App.id == app_id).first()
        if not app_model or not app_model.is_public:
            return None

        return {
            "id": app_model.id,
            "name": app_model.name,
            "icon": app_model.icon,
            "icon_background": app_model.icon_background,
            "mode": app_model.mode,
            "export_data": AppDslService.export_dsl(app_model=app_model),
        }
