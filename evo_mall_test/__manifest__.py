{
  "name"                 :  "TEST",
  "category"             :  "Custom",
  'version'              :  '17.0.0.0.2',
  'depends'              :  ['base','hr_holidays'],
  'data': [
        'views/hr_leave_view_form_manager_inherit.xml',
    ],
  'assets': {
        'web.assets_backend': [
            'evo_mall_test/static/src/**/*.xml',
            'evo_mall_test/static/src/**/*.js',
        ],
    },
 
  "application"          :  True,
  "installable"          :  True,
  "auto_install"         :  False, 
}
