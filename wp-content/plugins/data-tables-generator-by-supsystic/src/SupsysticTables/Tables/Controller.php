<?php


class SupsysticTables_Tables_Controller extends SupsysticTables_Core_BaseController
{
    /**
     * Shows the list of the tables.
     * @return Rsc_Http_Response
     */
    public function indexAction()
    {
        try {
            $tables = $this->getModel('tables')->getAll(
                array(
                    'order'    => 'DESC',
                    'order_by' => 'id'
                )
            );

            return $this->response(
                '@tables/index.twig',
                array('tables' => $tables)
            );
        } catch (Exception $e) {
            return $this->response('error.twig', array('exception' => $e));
        }
    }

    /**
     * Validate and creates the new table.
     * @param Rsc_Http_Request $request
     * @return Rsc_Http_Response
     */
    public function createAction(Rsc_Http_Request $request)
    {
        $title = $request->post->get('title');
        $title = trim($title);

        try {
            if (!$this->isValidTitle($title)) {
                return $this->ajaxError(
                    $this->translate(
                        'Title can\'t be empty or more then 255 characters'
                    )
                );
            }

            $tableId = $this->getModel('tables')->add(
                array('title' => $title, 'settings' => serialize(array()))
            );
        } catch (Exception $e) {
            return $this->ajaxError($e->getMessage());
        }

        return $this->ajaxSuccess(
            array(
                'url' => $this->generateUrl(
                    'tables',
                    'view',
                    array('id' => $tableId)
                )
            )
        );
    }

    /**
     * Removes the table.
     * @param Rsc_Http_Request $request
     * @return Rsc_Http_Response
     */
    public function removeAction(Rsc_Http_Request $request)
    {
        $id = $this->isAjax() ? $request->post->get('id') : $request->query->get('id');

        try {
            $this->getModel('tables')->removeById($id);
        } catch (Exception $e) {
            if ($this->isAjax()) {
                return $this->ajaxError($e->getMessage());
            }

            return $this->response('error.twig', array('exception' => $e));
        }

        if ($this->isAjax()) {
            return $this->ajaxSuccess();
        }

        return $this->redirect($this->generateUrl('tables'));
    }

    /**
     * Show the table settings, editor, etc.
     * @param Rsc_Http_Request $request
     * @return Rsc_Http_Response
     */
    public function viewAction(Rsc_Http_Request $request)
    {
        try {
            $id = $request->query->get('id');
            $table = $this->getModel('tables')->getById($id);
        } catch (Exception $e) {
            return $this->response('error.twig', array('exception' => $e));
        }

        return $this->response(
            '@tables/view.twig',
            array(
                'table'      => $table,
                'attributes' => array(
                    'cols' => $request->query->get('cols', 5),
                    'rows' => $request->query->get('rows', 5)
                )
            )
        );
    }

    /**
     * Renames the table.
     * @param Rsc_Http_Request $request
     * @return Rsc_Http_Response
     */
    public function renameAction(Rsc_Http_Request $request)
    {
        $id = $request->post->get('id');
        $title = $request->post->get('title');

        try {
            $this->getModel('tables')->set($id, array(
                'title' => $title
            ));
        } catch (Exception $e) {
            return $this->ajaxError($e->getMessage());
        }

        return $this->ajaxSuccess();
    }

    /**
     * Returns the table columns.
     * @param Rsc_Http_Request $request
     * @return Rsc_Http_Response
     */
    public function getColumnsAction(Rsc_Http_Request $request)
    {
        /** @var SupsysticTables_Tables_Model_Tables $tables */
        $tables = $this->getModel('tables');
        $id = $request->post->get('id');

        try {
            return $this->ajaxSuccess(
                array('columns' => $tables->getColumns($id))
            );
        } catch (Exception $e) {
            return $this->ajaxError($e->getMessage());
        }
    }

    /**
     * Updates the table columns.
     * @param Rsc_Http_Request $request
     * @return Rsc_Http_Response
     */
    public function updateColumnsAction(Rsc_Http_Request $request)
    {
        /** @var SupsysticTables_Tables_Model_Tables $tables */
        $tables = $this->getModel('tables');
        $id = $request->post->get('id');
        $columns = $request->post->get('columns');

        try {
            $tables->setColumns($id, $columns);
        } catch (Exception $e) {
            return $this->ajaxError(
                sprintf(
                    $this->translate(
                        'Failed to save table columns: %s',
                        $e->getMessage()
                    )
                )
            );
        }

        return $this->ajaxSuccess();
    }

    /**
     * Returns the table rows.
     * @param Rsc_Http_Request $request
     * @return Rsc_Http_Response
     */
    public function getRowsAction(Rsc_Http_Request $request)
    {
        /** @var SupsysticTables_Tables_Model_Tables $tables */
        $tables = $this->getModel('tables');
        $id = $request->post->get('id');

        try {
            return $this->ajaxSuccess(array(
                'rows' => $tables->getRows($id)
            ));
        } catch (Exception $e) {
            return $this->ajaxError($e->getMessage());
        }
    }

    /**
     * Updates the table rows.
     * @param Rsc_Http_Request $request
     * @return Rsc_Http_Response
     */
    public function updateRowsAction(Rsc_Http_Request $request)
    {
        /** @var SupsysticTables_Tables_Model_Tables $tables */
        $tables = $this->getModel('tables');
        $id = $request->post->get('id');
        $rows = json_decode($request->post->get('rows'), true);

        try {
            $tables->setRows($id, $rows);
        } catch (Exception $e) {
            return $this->ajaxError(
                sprintf(
                    $this->translate(
                        'Failed to save table rows: %s',
                        $e->getMessage()
                    )
                )
            );
        }

        return $this->ajaxSuccess();
    }

    /**
     * Saves the table settings.
     * @param Rsc_Http_Request $request
     * @return Rsc_Http_Response
     */
    public function saveSettingsAction(Rsc_Http_Request $request)
    {
        $id = $request->post->get('id');
        parse_str($request->post->get('settings'), $settings);

        try {
            $this->getModel('tables')->set($id, array(
                'settings' => serialize($settings)
            ));
        } catch (Exception $e) {
            return $this->ajaxError($e->getMessage());
        }

        return $this->ajaxSuccess();
    }

    /**
     * Renders the table.
     * @param Rsc_Http_Request $request
     * @return Rsc_Http_Response
     */
    public function renderAction(Rsc_Http_Request $request)
    {
        /** @var SupsysticTables_Tables_Module $tables */
        $tables = $this->getEnvironment()->getModule('tables');
        $id = $request->post->get('id');

        return $this->ajaxSuccess(array('table' => $tables->render((int)$id)));
    }

    public function updateMetaAction(Rsc_Http_Request $request)
    {
        /** @var SupsysticTables_Tables_Model_Tables $tables */
        $tables = $this->getModel('tables');
        $id = $request->post->get('id');
        $meta = json_decode($request->post->get('meta'), true);

        try {
            $tables->setMeta($id, $meta);
        } catch (Exception $e) {
            return $this->ajaxError(
                sprintf(
                    $this->translate('Failed to save table meta data: %s'),
                    $e->getMessage()
                )
            );
        }

        return $this->ajaxSuccess();
    }

    public function getMetaAction(Rsc_Http_Request $request)
    {
        $id = $request->post->get('id');
        /** @var SupsysticTables_Tables_Model_Tables $tables */
        $tables = $this->getModel('tables');

        $table = $tables->getById($id);

        return $this->ajaxSuccess(array('meta' => $table->meta));
    }

    /**
     * Validates the table title.
     * @param string $title
     * @return bool
     */
    protected function isValidTitle($title)
    {
        return is_string($title) && ($title !== '' && strlen($title) < 255);
    }

	public function checkReviewNoticeAction(Rsc_Http_Request $request) {
		$showNotice = get_option('showTablesRevNotice');
		$show = false;

		if(!$showNotice) {
			update_option('showTablesRevNotice', array(
				'date' => new DateTime(),
				'is_shown' => false
			));
		} else {
			$currentDate = new DateTime();

			if(($currentDate->diff($showNotice['date'])->d > 7) && $showNotice['is_shown'] != 1) {
				$show = true;
			}
		}

		return $this->response(
			Rsc_Http_Response::AJAX,
			array('show' => $show)
		);
	}

	public function checkNoticeButtonAction(Rsc_Http_Request $request) {
		$code  = $request->post->get('buttonCode');
		$showNotice = get_option('showTablesRevNotice');

		if($code == 'is_shown') {
			$showNotice['is_shown'] = true;
		} else {
			$showNotice['date'] = new DateTime();
		}

		$this->sendUsageStat($code);
		update_option('showTablesRevNotice', $showNotice);

		return $this->response(Rsc_Http_Response::AJAX);
	}

	public function sendUsageStat($state) {
		$apiUrl = 'http://54.68.191.217';

		$reqUrl = $apiUrl . '?mod=options&action=saveUsageStat&pl=rcs';
		$res = wp_remote_post($reqUrl, array(
			'body' => array(
				'site_url' => get_bloginfo('wpurl'),
				'site_name' => get_bloginfo('name'),
				'plugin_code' => 'stb',
				'all_stat' => array('views' => 'review', 'code' => $state),
			)
		));

		return true;
	}
}